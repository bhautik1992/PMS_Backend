import User from "../models/User.js";
import { successResponse, errorResponse } from "../helpers/ResponseHandler.js";

export const resetPassword = async (req, res) => {
    try{
        const { token, password } = req.body;
    
        const user = await User.findOne({ 
            reset_token: token, 
            reset_token_expires: { $gt: Date.now() }
        });

        if(!user) return errorResponse(res, 'The reset password link has expired or is invalid. Please request a new one to proceed.', null, 400);
        
        user.password            = password;
        user.reset_token         = null;
        user.reset_token_expires = null;
        await user.save();

        return successResponse(res, user, 200, 'Password reset successfully');
    }catch(error){
        // console.log(error.message);
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}


