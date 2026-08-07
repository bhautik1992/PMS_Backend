import User from '../models/User.js';
import Settings from '../models/Settings.js';
import Designation from '../models/Designation.js';
import Banks from '../models/Banks.js';
import Roles from '../models/Roles.js';
import { successResponse, errorResponse } from '../helpers/ResponseHandler.js';
import { generateAccessToken } from '../helpers/JWTToken.js';
import { getPermissionsLists } from '../helpers/Common.js';
import {
    issueRefreshToken,
    rotateRefreshToken,
    revokeRefreshTokenFromRequest,
    enforceRefreshSessionLimit
} from '../helpers/RefreshTokenService.js';

const sanitizeUser = (user) => {
    const object = user.toObject();
    object._token = generateAccessToken(user._id);
    delete object.password;
    delete object._refreshToken;
    return object;
};

export const login = async (req, res) => {
    const { company_email, password,rememberMe } = req.body;

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
                    select: 'name',
                },
            });

        if (!user) {
            return errorResponse(res, 'User not found!', null, 404);
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return errorResponse(res, 'Invalid credentials,Please try again...', null, 400);
        }

        await enforceRefreshSessionLimit(user._id);
        await issueRefreshToken(user._id, res, Boolean(rememberMe));

        const object = sanitizeUser(user);

        const banks = await Banks.find().select('_id name').sort({ _id: -1 });
        const designation = await Designation.find().select('_id name').sort({ _id: -1 });
        const roles = await Roles.find().select('_id name').sort({ _id: -1 });
        const permissions = await getPermissionsLists(user._id, user.role_id._id);
        const settings = await Settings.findOne().select('-createdAt -updatedAt -deletedAt -__v');

        return res.status(200).json({
            success: true,
            message: 'Loggedin successfully.',
            data: object,
            banks,
            designation,
            roles,
            permissions,
            settings,
        });
    } catch (error) {
        return errorResponse(res, 'Error during login', error, 500);
    }
};

//for refresh token
export const refreshToken = async (req, res) => {
    try {
        const result = await rotateRefreshToken(req, res);

        if (!result.ok) {
            return errorResponse(res, result.message, null, result.status);
        }

        return successResponse(
            res,
            { accessToken: result.accessToken },
            200,
            'Token refreshed'
        );
    } catch (error) {
        return errorResponse(res, 'Error refreshing token', error, 500);
    }
};


export const logout = async (req, res) => {
    try {
        //removing the refresh cookie 
        await revokeRefreshTokenFromRequest(req, res);
        return successResponse(res, {}, 200, 'Logged out successfully');
    } catch (error) {
        return errorResponse(res, 'Error during logout', error, 500);
    }
};
