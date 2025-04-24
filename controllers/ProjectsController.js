import Projects from '../models/Projects.js';
import { successResponse, errorResponse } from '../helpers/ResponseHandler.js';
import mongoose from 'mongoose';

export const index = async (req, res) => {
    try {
        const { userId } = req.params;
        let projects     = [];

        if(userId){
            projects = await Projects.aggregate([
                {
                    $match: { users_id: new mongoose.Types.ObjectId(userId) }
                },
                {
                    $lookup: {
                        from: "clients",
                        localField: "client_id",
                        foreignField: "_id",
                        as: "client"
                    }
                },
                {
                    $unwind: {
                        path: "$client",
                        preserveNullAndEmptyArrays: true
                    }
                },

                {
                    $lookup: {
                      from: "tasks",
                      localField: "_id",
                      foreignField: "project_id",
                      as: "tasks"
                    }
                },
                {
                    $lookup: {
                      from: "time_entries",
                      let: { projectId: "$_id" },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ["$project_id", "$$projectId"]
                            }
                          }
                        }
                      ],
                      as: "time_entries"
                    }
                },
                {
                    $addFields: {
                      total_task_hours: { $sum: "$tasks.hours" },
                      total_logged_hours: { $sum: "$time_entries.hours" }
                    }
                },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        type: 1,
                        price: 1,
                        currency: 1,
                        billing_cycle: 1,
                        client_id: 1,
                        status: 1,
                        total_task_hours: 1,
                        total_logged_hours: 1,
                        start_date: {
                            $dateToString: { format: "%d-%m-%Y", date: "$start_date" }
                        },
                        end_date: {
                            $dateToString: { format: "%d-%m-%Y", date: "$end_date" }
                        },
                        createdAt: {
                            $dateToString: { format: "%d-%m-%Y", date: "$createdAt" }
                        },
                        client: {
                            _id: "$client._id",
                            first_name: "$client.first_name",
                            last_name: "$client.last_name",
                            email: "$client.email",
                            country: "$client.country",
                        }
                    }
                }
            ]);
        }else{
            projects = await Projects.find().sort({ _id: -1 });
        }

        return successResponse(res,projects);
    } catch (error) {
        // console.log(error.message)
        return errorResponse(res,process.env.ERROR_MSG,error,500);
    }
}

export const create = async (req, res) => {
    try {
        const modifiedUser = req.body.users_id.map(({ value }) => ( value ));
        
        let data = {
            ...req.body,
            type:req.body.type.value,
            currency:req.body.currency.value,
            billing_cycle:req.body.billing_cycle.value,
            users_id: modifiedUser,
            client_id:req.body.client_id.value,
            status:req.body.status.value,
        }

        const project = new Projects(data);
        await project.save();
        
        return successResponse(res, {}, 200, "Project Created Successfully");
    } catch (error) {
        // console.log(error.message)
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const edit = async (req, res) => {
    try{
        const { id } = req.params;
        
        if(!mongoose.Types.ObjectId.isValid(id)){
            return errorResponse(res, process.env.NO_RECORD, null, 400);
        }

        const project = await Projects.findById(id);
        if(!project){
            return errorResponse(res, process.env.NO_RECORD, null, 404);
        }

        return successResponse(res, project, 200, '');
    } catch (error) {
        // console.log(error.message);
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const update = async (req, res) => {
    try {
        const modifiedUser = req.body.users_id.map(({ value }) => ( value ));
        
        let data = {
            ...req.body,
            type:req.body.type.value,
            currency:req.body.currency.value,
            billing_cycle:req.body.billing_cycle.value,
            users_id: modifiedUser,
            client_id:req.body.client_id.value,
            status:req.body.status.value,
        }

        await Projects.findByIdAndUpdate(req.body._id, data, { new: true });        
        return successResponse(res, {}, 200, "Project Updated Successfully");
    } catch (error) {
        // console.log(error.message)
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const duration = async (req, res) => {
    try{
        const { id } = req.params;
        
        if(!mongoose.Types.ObjectId.isValid(id)){
            return errorResponse(res, process.env.NO_RECORD, null, 400);
        }

        const project = await Projects.findById(id).select('start_date end_date');
        if(!project){
            return errorResponse(res, process.env.NO_RECORD, null, 404);
        }

        return successResponse(res, project, 200, '');
    } catch (error) {
        // console.log(error.message);
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const destroy = async (req, res) => {
    try {
        const { id } = req.body;
        
        await Projects.delete({_id:id})
        return successResponse(res, {}, 200, "Project Deleted Successfully");
    }catch(error){
        // error.message
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const team = async (req, res) => {
    try{
        const { id } = req.params;
        
        if(!mongoose.Types.ObjectId.isValid(id)){
            return errorResponse(res, process.env.NO_RECORD, null, 400);
        }

        const team = await Projects.findById(id)
            .select('users_id')
            .populate({
                path: 'users_id',
                select: 'first_name last_name company_email profile_photo',
                populate: {
                    path: 'role_id',
                    select: 'name'
                }
            });

        if(!team){
            return errorResponse(res, process.env.NO_RECORD, null, 404);
        }

        return successResponse(res, team, 200, '');
    } catch (error) {
        // console.log(error.message);
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}


