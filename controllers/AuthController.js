import User from '../models/User.js';
import Settings from '../models/Settings.js';
import Designation from '../models/Designation.js';
import Banks from '../models/Banks.js';
import Roles from '../models/Roles.js';
import { successResponse, errorResponse } from '../helpers/ResponseHandler.js';
import { generateToken } from '../helpers/JWTToken.js';
import { getPermissionsLists } from '../helpers/Common.js';

export const login = async (req, res) => {
    const { company_email, password } = req.body;
    
    try {
        const user = await User.findOne({ company_email })
            .select('-createdAt -updatedAt -deletedAt -deleted -__v')
            .populate('role_id', 'name')
            .populate('designation_id', 'name')
            .populate({
                path: 'reporting_to',
                select: 'first_name last_name designation_id',
                populate: {
                    path: 'designation_id',
                    select: 'name'
                }
            });

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

        const banks = await Banks.find().select('_id name').sort({ _id: -1 });
        const designation = await Designation.find().select('_id name').sort({ _id: -1 });
        const roles = await Roles.find().select('_id name').sort({ _id: -1 });
        const permissions = await getPermissionsLists(user._id,user.role_id._id);
        const settings = await Settings.findOne().select('-createdAt -updatedAt -deletedAt -__v');
        
        return res.status(200).json({
            success: true,
            message:'Loggedin successfully.',
            data:object,
            banks,
            designation,
            roles,
            permissions,
            settings,
        });        
        // return successResponse(res, object, 200, 'Loggedin successfully.');
    } catch (error) {
        // console.log(error.message);
        return errorResponse(res, 'Error during login', error, 500);
    }
};


