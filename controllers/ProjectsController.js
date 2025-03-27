import Projects from '../models/Projects.js';
import { successResponse, errorResponse } from '../helpers/ResponseHandler.js';

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

        successResponse(res,projects);
    } catch (error) {
        // console.log(error.message)
        errorResponse(res,process.env.ERROR_MSG,error,500);
    }
}

export const create = async (req, res) => {
    try {
        const modifiedUser = req.body.users_id.map(({ value }) => ( value ));
        
        let data = {
            ...req.body,
            billing_cycle:req.body.billing_cycle.value,
            currency:req.body.currency.value,
            status:req.body.status.value,
            type:req.body.type.value,
            users_id: modifiedUser
        }

        const project = new Projects(data);
        await project.save();
        
        successResponse(res, {}, 200, "Project Created Successfully");
    } catch (error) {
        // console.log(error.message)
        errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}


