import Settings from "../models/Settings.js";
import User from "../models/User.js";

import { successResponse, errorResponse } from "../helpers/ResponseHandler.js";

export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    return successResponse(res, settings, 200, "Settings Fetch Successfully");
  } catch (error) {
    // error.message
    return errorResponse(res, process.env.ERROR_MSG, error, 500);
  }
};

export const saveSettings = async (req, res) => {
  try {
    const updateData = req.body;
    let settings = await Settings.findOne();

    if (settings) {
      settings = await Settings.findOneAndUpdate({}, updateData, {
        new: true,
        upsert: true,
      });

      if (updateData.orignal_code !== updateData.emp_code) {
        await User.updateMany(
          { employee_code: new RegExp(`^${updateData.orignal_code}`) },
          [
            {
              $set: {
                employee_code: {
                  $replaceOne: {
                    input: "$employee_code",
                    find: updateData.orignal_code,
                    replacement: updateData.emp_code,
                  },
                },
              },
            },
          ]
        );
      }
    }

    return successResponse(res, settings, 200, "Settings Saved Successfully");
  } catch (error) {
    console.log(error.message);
    return errorResponse(res, process.env.ERROR_MSG, error, 500);
  }
};
