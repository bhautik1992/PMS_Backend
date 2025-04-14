import Holiday from "../models/Holiday.js";
import { successResponse, errorResponse } from "../helpers/ResponseHandler.js";
import mongoose from 'mongoose';
import moment from 'moment';

export const index = async (req, res) => {
    try {
        const { page = 1, perPage = 10, search = "" } = req.query;
        const pageNumber    = parseInt(page, 10);
        const perPageNumber = parseInt(perPage, 10);

        const query = search ? { name: new RegExp(search, "i") } : {};

        const holidays = await Holiday.aggregate([
            { $match: query },
            { $sort: { _id: -1 } },
            { $skip: (pageNumber - 1) * perPageNumber },
            { $limit: perPageNumber },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    start_date: {
                        $dateToString: { format: "%d/%m/%Y", date: "$start_date" }
                    },
                    end_date: {
                        $dateToString: { format: "%d/%m/%Y", date: "$end_date" }
                    }
                }
            }
        ]);

        const total = await Holiday.countDocuments(query);
        return successResponse(res, { holidays, total });
    } catch (error) {
        // console.log(error.message)
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
};

export const create = async (req, res) => {
    try {
        let message = 'Holiday Created Succesfully';
        const { holidayId } = req.body;
        
        req.body.start_date = moment(req.body.start_date, "DD-MM-YYYY").format("YYYY-MM-DD");
        if (req.body.end_date) {
            req.body.end_date = moment(req.body.end_date, "DD-MM-YYYY").format("YYYY-MM-DD");
        }

        if (holidayId) {
            const updatedCountry = await Holiday.findByIdAndUpdate(holidayId, req.body, { new: true });

            if (!updatedCountry) {
                return errorResponse(res, "Holiday not found", null, 404);
            }

            message = 'Holiday Updated Successfully';
        }else{
            await new Holiday(req.body).save();
        }

        successResponse(res, {}, 200, message);
    } catch (error) {
        // console.log(e.message);
        errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const edit = async (req, res) => {
    try{
        const { id } = req.params;
        
        if(!mongoose.Types.ObjectId.isValid(id)){
            return errorResponse(res, process.env.NO_RECORD, null, 400);
        }

        const holiday = await Holiday.findById(id);
        if(!holiday) {
            return errorResponse(res, process.env.NO_RECORD, null, 404);
        }
        
        return successResponse(res, holiday, 200, '');
    } catch (error) {
        // console.log(error.message);
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const destroy = async (req, res) => {
    try {
        const { id } = req.body;
        
        await Holiday.delete({_id:id})
        return successResponse(res, {}, 200, "Holiday Deleted Successfully");
    }catch(error){
        // error.message
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}


