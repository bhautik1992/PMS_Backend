import User from '../models/User.js';
import { successResponse, errorResponse } from '../helpers/ResponseHandler.js';
import { generateToken } from '../helpers/JWTToken.js';
import { getPermissionsLists } from '../helpers/Common.js';

export const login = async (req, res) => {
    const { company_email, password } = req.body;
    
    try {
        const user = await User.findOne({ company_email }).select('-createdAt -updatedAt -deletedAt -deleted -__v');
        if(!user) {
            return errorResponse(res,'User not found!', null, 404);
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return errorResponse(res, 'Invalid credentials,Please try again...', null, 400);
        }

        const object  = user.toObject();
        object._token = generateToken(user._id);
        delete object.password;

        const permissions = await getPermissionsLists(user._id,user.role_id);

        return res.status(200).json({
            success: true,
            message:'Loggedin successfully.',
            data:object,
            permissions
        });        
        // successResponse(res, object, 200, 'Loggedin successfully.');
    } catch (error) {
        // console.log(error.message);
        errorResponse(res, 'Error during login', error, 500);
    }
};


