import Tasks from '../models/Tasks.js';
import { successResponse, errorResponse } from '../helpers/ResponseHandler.js';
import mongoose from 'mongoose';

export const index = async (req, res) => {
    try {
        const { page = 1, perPage = 10, search = "", userId } = req.query;
        const pageNumber    = parseInt(page, 10);
        const perPageNumber = parseInt(perPage, 10);

        const query = search ? { name: new RegExp(search, "i") } : {};

        const tasks = await Tasks.aggregate([
            // { $match: query },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user_info"
                }
            },
            { $unwind: { path: "$user_info", preserveNullAndEmptyArrays: true } },

            {
                $match: {
                    $or: [
                        { user_id: new mongoose.Types.ObjectId(userId) },
                        { "user_info.reporting_to": new mongoose.Types.ObjectId(userId) }
                    ]
                }
            },
            
            {
                $lookup: {
                    from: "projects", // Projects collection to join
                    localField: "project_id", // Field in Tasks collection
                    foreignField: "_id",  // Field in Projects collection
                    as: "project_info" // The alias for project info
                }
            },
            { $unwind: { path: "$project_info", preserveNullAndEmptyArrays: true } },
            
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
                    // user_name: {
                    //     $ifNull: [
                    //         { $concat: [
                    //             { $ifNull: ["$user_info.first_name", null] },
                    //             " ",
                    //             { $ifNull: ["$user_info.last_name", null] }
                    //         ] },
                    //         null
                    //     ]
                    // },

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

        const total = await Tasks.countDocuments(query);
        return successResponse(res, { data: tasks, total });
    } catch (error) {
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
};

export const create = async (req, res) => {
    try {
        let data = {
            ...req.body,
            project_id:req.body.project.value,
            user_id:req.body.user.value,
            start_date:req.body.start_end_date[0],
            end_date:req.body.start_end_date[1],
        }

        const task = new Tasks(data);
        await task.save();

        return successResponse(res, {}, 200, "Task Created Successfully");
    } catch (error) {
        // error.message
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const destroy = async (req, res) => {
    try {
        const { id, deletedBy } = req.body;
        
        await Tasks.delete({_id:id},deletedBy)
        return successResponse(res, {}, 200, "Task Deleted Successfully");
    }catch(error){
        // error.message
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const edit = async (req, res) => {
    try{
        const { id } = req.params;
        
        if(!mongoose.Types.ObjectId.isValid(id)){
            return errorResponse(res, process.env.NO_RECORD, null, 400);
        }

        const task = await Tasks.findById(id).populate('project_id', 'start_date end_date');
        if(!task) {
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
            project_id:req.body.project.value,
            user_id:req.body.user.value,
            start_date:req.body.start_end_date[0],
            end_date:req.body.start_end_date[1],
        }
        delete data.created_by

        const task = await Tasks.findByIdAndUpdate(_id, data, { new: true });
        if (!task) {
            return errorResponse(res, "Task not found!", null, 404);
        }

        return successResponse(res, {}, 200, "Task Updated Successfully");
    } catch (error) {
        // error.message
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}


