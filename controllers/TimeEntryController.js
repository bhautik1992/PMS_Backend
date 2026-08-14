import TimeEntry from '../models/TimeEntry.js';
import Tasks from '../models/Tasks.js';
import { successResponse, errorResponse } from '../helpers/ResponseHandler.js';
import { convertTimeToDecimal, getReportingHierarchyUserIds } from '../helpers/Common.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

const formatHours = (hours = 0) => Number(Number(hours || 0).toFixed(2));
const formatDate = (date) => {
    if(!date){
        return '';
    }

    const value = new Date(date);
    const day = String(value.getUTCDate()).padStart(2, '0');
    const month = String(value.getUTCMonth() + 1).padStart(2, '0');
    const year = value.getUTCFullYear();

    return `${day}-${month}-${year}`;
}

export const create = async (req, res) => {
    try {
        const data = { ...req.body };
        const task = await Tasks.findById(data.task_id).select('project_id user_id start_date end_date');

        if(!task){
            return errorResponse(res, process.env.NO_RECORD, null, 404);
        }

        const entryDate = new Date(`${data.date}T00:00:00.000Z`);
        const taskStartDate = new Date(task.start_date);
        const taskEndDate = new Date(task.end_date);
        taskStartDate.setUTCHours(0, 0, 0, 0);
        taskEndDate.setUTCHours(23, 59, 59, 999);

        if(Number.isNaN(entryDate.getTime()) || entryDate < taskStartDate || entryDate > taskEndDate){
            return errorResponse(res, 'Time entry date must be between task start date and end date.', null, 400);
        }

        const hours = convertTimeToDecimal(data.hours);
        if(Number.isNaN(hours) || hours <= 0){
            return errorResponse(res, 'Please enter valid hours.', null, 400);
        }

        data.project_id = task.project_id;
        data.user_id = task.user_id;
        data.date = entryDate;
        data.hours = hours;

        const timeEntry = new TimeEntry(data);
        await timeEntry.save();

        return successResponse(res, {}, 200, "Time Entry Saved Successfully");
    } catch (error) {
        // error.message
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const history = async (req, res) => {
    try{
        const { taskId } = req.params;
        
        if(!mongoose.Types.ObjectId.isValid(taskId)){
            return errorResponse(res, process.env.NO_RECORD, null, 400);
        }

        const entries = await TimeEntry.aggregate([
            {
              $match: {
                task_id: new mongoose.Types.ObjectId(taskId)
              }
            },
            {
                $addFields: {
                    date: {
                        $dateToString: {
                            format: "%d/%m/%Y",
                            date: "$date"
                        }
                    }
                }
            },
            {
                $sort: {
                  date: -1
                }
            }
        ]);
    
        return successResponse(res, entries, 200, '');
    } catch (error) {
        // console.log(error.message);
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const report = async (req, res) => {
    try {
        const { userId, projectId, month, year } = req.query;
        const reportMonth = parseInt(month, 10);
        const reportYear = parseInt(year, 10);

        const isAllUsers = userId === 'all';
        const hasProjectFilter = projectId && projectId !== 'all';

        if(!isAllUsers && !mongoose.Types.ObjectId.isValid(userId)){
            return errorResponse(res, 'Please select a valid employee.', null, 400);
        }

        if(hasProjectFilter && !mongoose.Types.ObjectId.isValid(projectId)){
            return errorResponse(res, 'Please select a valid project.', null, 400);
        }

        if(!reportMonth || reportMonth < 1 || reportMonth > 12 || !reportYear){
            return errorResponse(res, 'Please select a valid month and year.', null, 400);
        }

        const startDate = new Date(Date.UTC(reportYear, reportMonth - 1, 1));
        const endDate = new Date(Date.UTC(reportYear, reportMonth, 1));
        const daysInMonth = new Date(reportYear, reportMonth, 0).getDate();
        const authUser = await User.findById(req.user.id).populate('role_id', 'name').lean();
        const isAdmin = authUser?.role_id?.name?.toLowerCase() === 'admin';
        const allowedUserIds = isAdmin ? [] : await getReportingHierarchyUserIds(req.user.id);
        const taskMatch = {
            start_date: { $lt: endDate },
            end_date: { $gte: startDate },
            deleted: { $ne: true },
            deletedAt: null
        };

        if(isAdmin && !isAllUsers){
            taskMatch.user_id = new mongoose.Types.ObjectId(userId);
        }else if(!isAdmin && isAllUsers){
            taskMatch.user_id = { $in: allowedUserIds.map((id) => new mongoose.Types.ObjectId(id)) };
        }else if(!isAdmin){
            if(!allowedUserIds.includes(userId)){
                return errorResponse(res, 'You do not have access to this employee time entry report.', null, 403);
            }

            taskMatch.user_id = new mongoose.Types.ObjectId(userId);
        }

        if(hasProjectFilter){
            taskMatch.project_id = new mongoose.Types.ObjectId(projectId);
        }

        const tasks = await Tasks.aggregate([
            { $match: taskMatch },
            {
                $lookup: {
                    from: 'projects',
                    localField: 'project_id',
                    foreignField: '_id',
                    as: 'project'
                }
            },
            { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'time_entries',
                    let: { taskId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$task_id', '$$taskId'] },
                                        { $gte: ['$date', startDate] },
                                        { $lt: ['$date', endDate] }
                                    ]
                                },
                                deleted: { $ne: true },
                                deletedAt: null
                            }
                        },
                        { $sort: { date: 1 } }
                    ],
                    as: 'entries'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    project_id: 1,
                    user_id: 1,
                    estimated_hours: '$hours',
                    start_date: 1,
                    end_date: 1,
                    description: 1,
                    entries: 1,
                    project_name: { $ifNull: ['$project.name', 'Project'] },
                    task_name: { $ifNull: ['$name', 'Task'] },
                    user_name: {
                        $trim: {
                            input: {
                                $concat: [
                                    { $ifNull: ['$user.first_name', ''] },
                                    ' ',
                                    { $ifNull: ['$user.last_name', ''] }
                                ]
                            }
                        }
                    }
                }
            },
            { $sort: { project_name: 1, task_name: 1, user_name: 1 } }
        ]);

        const dayTotals = {};
        const displayDayTotals = {};
        for(let day = 1; day <= daysInMonth; day++){
            dayTotals[day] = 0;
            displayDayTotals[day] = 0;
        }

        const taskRows = tasks.map(task => {
            const days = {};
            const displayDays = {};
            for(let day = 1; day <= daysInMonth; day++){
                days[day] = 0;
                displayDays[day] = 0;
            }

            const row = {
                key: `${task.project_id}-${task._id}`,
                project_id: task.project_id,
                task_id: task._id,
                project_name: task.project_name,
                task_name: task.task_name,
                user_id: task.user_id,
                user_name: task.user_name,
                description: task.description || '',
                project_task: `${task.project_name}-${task.task_name}`,
                estimated_hours: formatHours(task.estimated_hours),
                start_date: formatDate(task.start_date),
                end_date: formatDate(task.end_date),
                raw_end_date: task.end_date,
                days,
                display_days: displayDays,
                total: 0,
                display_total: 0,
                has_logged_entries: task.entries.length > 0,
                entries: []
            };

            task.entries.forEach(entry => {
                const day = entry.date.getUTCDate();
                const hours = formatHours(entry.hours);

                row.days[day] = formatHours(row.days[day] + hours);
                row.display_days[day] = row.days[day];
                row.total = formatHours(row.total + hours);
                row.display_total = row.total;
                row.entries.push({
                    _id: entry._id,
                    date: entry.date,
                    day,
                    hours,
                    description: entry.description || '',
                    task_description: task.description || '',
                    project_name: task.project_name,
                    task_name: task.task_name,
                    user_name: task.user_name,
                    source: 'logged'
                });
                dayTotals[day] = formatHours(dayTotals[day] + hours);
                displayDayTotals[day] = formatHours(displayDayTotals[day] + hours);
            });

            // Do not inject planned/estimated hours into display_days when there are no logged entries.
            // Previously, tasks without any time entries would populate a planned entry on the task end date
            // which caused UI to show hours (e.g. 30) for days that had no actual time entries. Avoid that behaviour
            // by leaving display_days and entries empty for tasks with no logged entries.

            return row;
        });

        const rows = taskRows;

        const grandTotal = formatHours(rows.reduce((sum, row) => sum + row.total, 0));
        const displayGrandTotal = formatHours(rows.reduce((sum, row) => sum + row.display_total, 0));

        return successResponse(res, {
            daysInMonth,
            rows,
            totals: {
                days: dayTotals,
                grandTotal,
                displayDays: displayDayTotals,
                displayGrandTotal
            },
            employee: isAllUsers ? 'All Employees' : tasks[0]?.user_name || ''
        });
    } catch (error) {
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}
