import Clients from '../models/Clients.js';
import { successResponse, errorResponse } from '../helpers/ResponseHandler.js';
import mongoose from 'mongoose';
import { formatWord } from '../helpers/Common.js';

export const index = async (req, res) => {
    try {
        const clients = await Clients.find().sort({ _id: -1 });
        
        return successResponse(res,clients);
    } catch (error) {
        // console.log(error.message)
        return errorResponse(res,process.env.ERROR_MSG,error,500);
    }
}

export const listing = async (req, res) => {
    try {
        const { page = 1, perPage = 10, search = "" } = req.query;
        const pageNumber    = parseInt(page, 10);
        const perPageNumber = parseInt(perPage, 10);

        const query = search ? { name: new RegExp(search, "i") } : {};

        const clients = await Clients.aggregate([
            { $match: query },
            { $sort: { _id: -1 } },
            { $skip: (pageNumber - 1) * perPageNumber },
            { $limit: perPageNumber },
            {
                $project: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    email: 1,
                    country: 1,
                    is_active: 1
                }
            }
        ]);

        const total = await Clients.countDocuments(query);
        return successResponse(res, { clients, total });
    } catch (error) {
        // console.log(error.message)
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
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

export const edit = async (req, res) => {
    try{
        const { id } = req.params;
        
        if(!mongoose.Types.ObjectId.isValid(id)){
            return errorResponse(res, process.env.NO_RECORD, null, 400);
        }

        const client = await Clients.findById(id);
        if(!client) {
            return errorResponse(res, process.env.NO_RECORD, null, 404);
        }

        return successResponse(res, client, 200, '');
    } catch (error) {
        // console.log(error.message);
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const update = async (req, res) => {
    try {
        const { personalInfo, addressInfo, clientId } = req.body;
        const mergedInfo = { ...personalInfo, ...addressInfo };

        const query = [];
        if (mergedInfo?.email?.trim()) query.push({ email: mergedInfo.email.trim() });

        const queryFilter = { $or: query };
        if(clientId) {
            queryFilter._id = { $ne: clientId };
        }

        const exiUser = query.length > 0 ? await Clients.findOne(queryFilter).lean() : null;        
        let clientError = await validateUniqueClientDetails(exiUser,mergedInfo);
        if(clientError !== ''){
            return errorResponse(res, clientError, null, 404);
        }

        await Clients.findByIdAndUpdate(clientId, mergedInfo, { new: true });
        return successResponse(res, {}, 200, 'Client Updated Successfully');
    } catch (error) {
        // console.log(error.message)
        return errorResponse(res,process.env.ERROR_MSG,error,500);
    }
}

export const destroy = async (req, res) => {
    try {
        const { id } = req.body;
        
        await Clients.delete({_id:id})
        return successResponse(res, {}, 200, "Client Deleted Successfully");
    }catch(error){
        // error.message
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}


