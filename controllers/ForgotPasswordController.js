import User from "../models/User.js";
import { successResponse, errorResponse } from "../helpers/ResponseHandler.js";
import crypto from 'crypto';
import { resetLinkEmail } from "../helpers/SendEmail.js";

export const forgotPassword = async (req, res) => {
    try{
        const { company_email: email } = req.body;
    
        const user = await User.findOneAndUpdate(
            { company_email: email },
            {
              reset_token: crypto.randomBytes(32).toString("hex"),
              reset_token_expires: Date.now() + 15 * 60 * 1000, // 15 minutes
            },
            { new: true }
        );

        if(!user) return errorResponse(res, process.env.NO_RECORD, null, 404);

        const resetLink = `${process.env.ALLOWED_ORIGIN}/reset_password?token=${user.reset_token}`;
        process.env.APP_ENV == 'production' && await resetLinkEmail(user,resetLink);

        return successResponse(res, {}, 200, 'Password reset link successfully sent to your email');
    }catch(error){
        // console.log(error.message);
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}


