import TimeEntry from '../models/TimeEntry.js';
import { successResponse, errorResponse } from '../helpers/ResponseHandler.js';
import { convertTimeToDecimal } from '../helpers/Common.js';

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


