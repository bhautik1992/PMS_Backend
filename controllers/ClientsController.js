import Clients from '../models/Clients.js';
import { successResponse, errorResponse } from '../helpers/ResponseHandler.js';

export const index = async (req, res) => {
    try {
        const clients = await Clients.find().sort({ _id: -1 });
        
        return successResponse(res,clients);
    } catch (error) {
        // console.log(error.message)
        return errorResponse(res,process.env.ERROR_MSG,error,500);
    }
}

export const create = async (req, res) => {
    try {
        const { personalInfo, addressInfo } = req.body;
        const mergedInfo = { ...personalInfo, ...addressInfo };

        const query = [];
        if (mergedInfo?.email?.trim()) query.push({ email: mergedInfo.email.trim() });

        const exiUser = query.length > 0 ? await Clients.findOne({ $or: query, deletedAt: null }).lean():null;        
        let clientError = await validateUniqueClientDetails(exiUser,mergedInfo);
        if(clientError !== ''){
            return errorResponse(res, clientError, null, 404);
        }

        await new Clients(mergedInfo).save();
        return successResponse(res, {}, 200, 'Client Created Successfully');
    } catch (error) {
        // console.log(error.message)
        if(error.code === 11000){
            const field          = Object.keys(error.keyPattern)[0];
            const formattedField = await formatWord(field);

            return errorResponse(res, `${formattedField} already exists. Please use a different one.`, 400);
        }

        return errorResponse(res,process.env.ERROR_MSG,error,500);
    }
}

export const validateUniqueClientDetails = async (existingRecord, newRecord) => {
    let errorMessage = "";

    if (existingRecord && existingRecord.email === newRecord?.email?.trim()) {
        errorMessage = 'Email is already exists.';
    }

    return errorMessage;
}


