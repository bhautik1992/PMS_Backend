import TimeEntry from '../models/TimeEntry.js';
import { successResponse, errorResponse } from '../helpers/ResponseHandler.js';
import { convertTimeToDecimal } from '../helpers/Common.js';
import mongoose from 'mongoose';

export const create = async (req, res) => {
    try {
        const data = req.body;
        data.hours = convertTimeToDecimal(data.hours);

        const timeEntry = new TimeEntry(data);
        await timeEntry.save();

        return successResponse(res, {}, 200, "Time Entry Saved Successfully");
    } catch (error) {
        // error.message
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const history = async (req, res) => {
    try{
        const { taskId } = req.params;
        
        if(!mongoose.Types.ObjectId.isValid(taskId)){
            return errorResponse(res, process.env.NO_RECORD, null, 400);
        }

        const entries = await TimeEntry.aggregate([
            {
              $match: {
                task_id: new mongoose.Types.ObjectId(taskId)
              }
            },
            {
                $addFields: {
                    date: {
                        $dateToString: {
                            format: "%d/%m/%Y",
                            date: "$date"
                        }
                    }
                }
            },
            {
                $sort: {
                  date: -1
                }
            }
        ]);

        if(entries.length===0) {
            return errorResponse(res, process.env.NO_RECORD, null, 404);
        }
    
        return successResponse(res, entries, 200, '');
    } catch (error) {
        // console.log(error.message);
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}


