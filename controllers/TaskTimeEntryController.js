import mongoose from 'mongoose';
import TimeEntry from '../models/TimeEntry.js';
import { successResponse, errorResponse } from '../helpers/ResponseHandler.js';

export const userAllTask = async (req, res) => {
    const { user, project, date } = req.body;
    
    try {
        const match = {
            user_id: new mongoose.Types.ObjectId(user),
            deleted: false,
          };
          
          const [monthStr, yearStr] = date.split('-');
          const month = parseInt(monthStr);
          const year = parseInt(yearStr);

          const startOfMonth = new Date(year, month - 1, 1); // Feb 1, 2025
          const endOfMonth = new Date(year, month, 1);       // Mar 1, 2025
          
          match.date = { $gt: startOfMonth, $lte: endOfMonth };
          
          if (project) {
            match.project_id = new mongoose.Types.ObjectId(project);
          }

        const entries = await TimeEntry.aggregate([
            {
                $match: match 
            },
            {
                $lookup: {
                  from: 'tasks',
                  localField: 'task_id',
                  foreignField: '_id',
                  as: 'task'
                }
              },   
              {
                $unwind: {
                  path: "$task",
                  preserveNullAndEmptyArrays: true 
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
              {
                $unwind: {
                  path: "$user",
                  preserveNullAndEmptyArrays: true 
                }
              }, 
              {
                $lookup: {
                  from: 'projects',
                  localField: 'project_id',
                  foreignField: '_id',
                  as: 'project'
                }
              },    
              {
                $unwind: {
                  path: "$project",
                  preserveNullAndEmptyArrays: true 
                }
              },                       
           {
                $project : {
                    'project.name' : 1,
                    'task.name' : 1,
                    'hours' : 1,
                    'date' : 1, 
                    'user.first_name' : 1
                }
           }
        ]);   
        return successResponse(res, { entries }, 200, "All projects with tasks");
    } catch (err) {
        console.error("userAllTask error:", err);
        return errorResponse(res, process.env.ERROR_MSG || "Server Error", err, 500);
    }
};