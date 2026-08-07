import Tasks from '../models/Tasks.js';
import Projects from '../models/Projects.js';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../helpers/ResponseHandler.js';
import { getAssignedProjectsList, getReporintgToList } from '../helpers/Common.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Projects from '../models/Projects.js';

const normalizeFilter = (filter) => {
    if(!filter){
        return [];
    }

    if(typeof filter === 'string'){
        try {
            const parsedFilter = JSON.parse(filter);
            return Array.isArray(parsedFilter) ? parsedFilter : Object.values(parsedFilter);
        } catch (error) {
            return [];
        }
    }

    if(Array.isArray(filter)){
        return filter;
    }

    return Object.values(filter);
}

const getTaskListPipeline = ({ userId, projectId = '', selAssignedTo = '', search = '', isAdmin = false }) => {
    const authUserId = new mongoose.Types.ObjectId(userId);
    const pipeline = [
        {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "user_info"
            }
        },
        { $unwind: { path: "$user_info", preserveNullAndEmptyArrays: true } },
    ];

    if(!isAdmin){
        pipeline.push(
        {
            $match: {
                deleted: { $ne: true },
                deletedAt: null,
                $or: [
                    { user_id: authUserId },
                    { "user_info.reporting_to": authUserId }
                ]
            }
        });
    }else{
        pipeline.push({
            $match: {
                deleted: { $ne: true },
                deletedAt: null
            }
        });
    }

    pipeline.push(
        {
            $lookup: {
                from: "projects",
                localField: "project_id",
                foreignField: "_id",
                as: "project_info"
            }
        },
        { $unwind: { path: "$project_info", preserveNullAndEmptyArrays: true } },
    );

    if(search){
        pipeline.push({
            $match: {
                $or: [
                    { name: new RegExp(search, "i") },
                    { "project_info.name": new RegExp(search, "i") },
                    { "user_info.first_name": new RegExp(search, "i") },
                    { "user_info.last_name": new RegExp(search, "i") },
                ]
            }
        });
    }

    const validProjectId = mongoose.Types.ObjectId.isValid(projectId) ? projectId : '';
    const validAssignedTo = mongoose.Types.ObjectId.isValid(selAssignedTo) ? selAssignedTo : '';

    if(validProjectId && validAssignedTo){
        pipeline.push({
            $match: {
                project_id: new mongoose.Types.ObjectId(validProjectId),
                user_id: new mongoose.Types.ObjectId(validAssignedTo)
            }
        });
    }else if(validProjectId){
        pipeline.push({
            $match: {
                project_id: new mongoose.Types.ObjectId(validProjectId)
            }
        });
    }else if(validAssignedTo){
        pipeline.push({
            $match: {
                user_id: new mongoose.Types.ObjectId(validAssignedTo)
            }
        });
    }

    return pipeline;
}

export const index = async (req, res) => {
    try {
        const { page = 1, perPage = 10, search = "", filter = [], userId } = req.query;

        const projectId = filter.find(f => f.type === 'project')?.value || '';
        const selAssignedTo = filter.find(f => f.type === 'assignedto')?.value || '';

        const pageNumber = parseInt(page, 10);
        const perPageNumber = parseInt(perPage, 10);

        const query = search ? { 
            $or: [
                { name: new RegExp(search, "i") },
            ]
        } : {};
        const currentUser = await User.findById(userId).populate('role_id')
        const isAdmin = currentUser?.role_id?.name === 'Admin'

        const tasks = await Tasks.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user_info"
                }
            },
            { $unwind: { path: "$user_info", preserveNullAndEmptyArrays: true } },
            ...(!isAdmin ? [{
                $match: {
                    $or: [
                        { user_id: new mongoose.Types.ObjectId(userId) },
                        { "user_info.reporting_to": new mongoose.Types.ObjectId(userId) }
                    ]
                }
            }] : []
            ),
            {
                $lookup: {
                    from: "projects", // Projects collection to join
                    localField: "project_id", // Field in Tasks collection
                    foreignField: "_id",  // Field in Projects collection
                    as: "project_info" // The alias for project info
                }
            },
            { $unwind: { path: "$project_info", preserveNullAndEmptyArrays: true } },
            ...(!isAdmin ? [
                {
                    $match: {
                        "project_info.users_id": new mongoose.Types.ObjectId(userId)
                    }
                }] : []
            ),
            ...(projectId && selAssignedTo ? [{
                $match: {
                    project_id: new mongoose.Types.ObjectId(projectId),
                    user_id: new mongoose.Types.ObjectId(selAssignedTo)
                }
            }] :
                projectId ? [{
                    $match: {
                        project_id: new mongoose.Types.ObjectId(projectId)
                    }
                }] :
                    selAssignedTo ? [{
                        $match: {
                            user_id: new mongoose.Types.ObjectId(selAssignedTo)
                        }
                    }] : []),

            {
                $lookup: {
                    from: "time_entries",
                    localField: "_id",
                    foreignField: "task_id",
                    as: "time_entries_info"
                }
            },
            {
                $addFields: {
                    total_logged_hours: {
                        $ifNull: [{ $sum: "$time_entries_info.hours" }, 0]
                    }
                }
            },

            { $sort: { _id: -1 } },
            { $skip: (pageNumber - 1) * perPageNumber },
            { $limit: perPageNumber },

            {
                $project: {
                    project_id: 1,
                    user_id: 1,
                    hours: {
                        $concat: [
                            { $toString: "$hours" },
                            ":00"
                        ]
                    },
                    total_logged_hours: 1,
                    start_date: {
                        $dateToString: {
                            format: "%d/%m/%Y",
                            date: "$start_date"
                        }
                    },
                    end_date: {
                        $dateToString: {
                            format: "%d/%m/%Y",
                            date: "$end_date"
                        }
                    },
                    ymd_start_date: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$start_date"
                        }
                    },
                    ymd_end_date: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$end_date"
                        }
                    },
                    name: 1,
                    description: 1,
                    user_name: {
                        $cond: {
                            if: { $eq: ["$user_id", new mongoose.Types.ObjectId(userId)] },
                            then: {
                                $concat: [
                                    //   "Self (",
                                    { $ifNull: ["$user_info.first_name", ""] },
                                    " ",
                                    { $ifNull: ["$user_info.last_name", ""] },
                                    //   ")"
                                ]
                            },
                            else: {
                                $trim: {
                                    input: {
                                        $concat: [
                                            { $ifNull: ["$user_info.first_name", ""] },
                                            " ",
                                            { $ifNull: ["$user_info.last_name", ""] }
                                        ]
                                    }
                                }
                            }
                        }
                    },

                    company_email: { $ifNull: ["$user_info.company_email", null] },
                    project_name: { $ifNull: ["$project_info.name", null] }
                },
            }
        ]);

        const totalResult = await Tasks.aggregate([
            ...listPipeline,
            { $count: 'total' }
        ]);
        const total = totalResult[0]?.total || 0;
        return successResponse(res, { data: tasks, total });
    } catch (error) {
        // error.message
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
};

export const create = async (req, res) => {
    try {
        let data = {
            ...req.body,
            project_id: req.body.project.value,
            user_id: req.body.user.value,
            start_date: req.body.start_end_date[0],
            end_date: req.body.start_end_date[1],
        }

        const task = new Tasks(data);
        await task.save();
        await Projects.findByIdAndUpdate(data.project_id, { $addToSet: { users_id: data.user_id } });

        return successResponse(res, {}, 200, "Task Created Successfully");
    } catch (error) {
        // error.message
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const view = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return errorResponse(res, process.env.NO_RECORD, null, 400);
        }
        const task = await Tasks.findById(id)
            .populate({ path: 'project_id', select: 'name description status start_date end_date' })
            .populate({ path: 'user_id', select: 'first_name last_name company_email profile_photo role_id', populate: { path: 'role_id', select: 'name' } });
        if (!task) return errorResponse(res, process.env.NO_RECORD, null, 404);
        return successResponse(res, task, 200, '');
    } catch (error) {
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
};


export const destroy = async (req, res) => {
    try {
        const { id, deletedBy } = req.body;

        await Tasks.delete({ _id: id }, deletedBy)
        return successResponse(res, {}, 200, "Task Deleted Successfully");
    } catch (error) {
        // error.message
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const edit = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return errorResponse(res, process.env.NO_RECORD, null, 400);
        }

        const task = await Tasks.findById(id).populate('project_id', 'start_date end_date');
        if (!task) {
            return errorResponse(res, process.env.NO_RECORD, null, 404);
        }

        return successResponse(res, task, 200, '');
    } catch (error) {
        // console.log(error.message);
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const update = async (req, res) => {
    try {
        const { _id } = req.body;

        let data = {
            ...req.body,
            project_id: req.body.project.value,
            user_id: req.body.user.value,
            start_date: req.body.start_end_date[0],
            end_date: req.body.start_end_date[1],
        }
        delete data.created_by

        const task = await Tasks.findByIdAndUpdate(_id, data, { new: true });
        if (!task) {
            return errorResponse(res, "Task not found!", null, 404);
        }
        await Projects.findByIdAndUpdate(data.project_id, { $addToSet: { users_id: data.user_id } });

        return successResponse(res, {}, 200, "Task Updated Successfully");
    } catch (error) {
        // error.message
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const getFilters = async (req, res) => {
    try {
        const { id } = req.query;
        let projects = null
        let reporting = null
        
        const currentUser = await User.findById(id).populate('role_id')
        const isAdmin = currentUser?.role_id?.name === 'Admin'
        if (!isAdmin) {
             projects = await getAssignedProjectsList(id);
             reporting = await getReporintgToList(id)
        }
        else{
            projects= await Projects.find({}).select('name _id')
            reporting=await User.find({}).select('_id first_name last_name')
        }
        return successResponse(res, { projects, reporting });
    } catch (error) {
        // console.log(error.message);
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}
