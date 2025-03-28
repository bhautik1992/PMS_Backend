import Clients from '../models/Clients.js';
import { successResponse, errorResponse } from '../helpers/ResponseHandler.js';

export const index = async (req, res) => {
    try {
        const clients = await Clients.find().sort({ _id: -1 });
        
        successResponse(res,clients);
    } catch (error) {
        // console.log(error.message)
        errorResponse(res,process.env.ERROR_MSG,error,500);
    }
}


