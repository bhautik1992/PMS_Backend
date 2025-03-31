import Projects from '../models/Projects.js';
import { successResponse, errorResponse } from '../helpers/ResponseHandler.js';
import mongoose from 'mongoose';

export const index = async (req, res) => {
    try {
        const { userId } = req.params;
        let projects     = [];

        if(userId){
            projects = await Projects.find({
                users_id: userId
            }).sort({ _id: -1 });
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


