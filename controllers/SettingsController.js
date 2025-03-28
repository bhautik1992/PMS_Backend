import Settings from '../models/Settings.js';
import { successResponse, errorResponse } from '../helpers/ResponseHandler.js';

export const getSettings = async (req, res) => {
    try {
        const settings = await Settings.findOne();
        return successResponse(res, settings, 200, "Settings Fetch Successfully");
    } catch (error) {
        // error.message
        return errorResponse(res,process.env.ERROR_MSG,error,500);
    }
}

export const saveSettings = async (req, res) => {
    try {
        const updateData = req.body;

        let settings = await Settings.findOne();
        if (settings) {
            settings = await Settings.findOneAndUpdate({}, updateData, { new: true, upsert: true });
        } else {
            settings = new Settings(updateData);
            await settings.save();
        }

        return successResponse(res, settings, 200, "Settings Saved Successfully");
    } catch (error) {
        // error.message
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}


