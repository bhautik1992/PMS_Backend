import RolePermissions from '../models/RolePermissions.js';
import {successResponse, errorResponse} from './ResponseHandler.js';
import Projects from '../models/Projects.js';
import User from '../models/User.js';

export const convertTimeToDecimal = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const decimalMinutes = minutes / 60;
    
    return hours + decimalMinutes;
}

export const getPermissionsByRole = async (role_id) => {
    try{
        return await RolePermissions.find({ role_id }).select('_id role_id permission_id');
    } catch (error) {
        // console.log(error.message)
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const getPermissionsLists = async (user_id,role_id) => {
    try{
        const result = await RolePermissions.aggregate([
            {
                $match: { role_id, deleted: false }
            },
            {
                $lookup: {
                    from: "permissions",
                    localField: "permission_id",
                    foreignField: "_id",
                    as: "permissionDetails"
                }
            },
            { $unwind: "$permissionDetails" },
            {
                $match: { "permissionDetails.deleted": false }
            },
            {
                $project: {
                    _id: 0,
                    action: "$permissionDetails.action"
                }
            },
            {
                $unionWith: {
                    coll: "user_permissions",
                    pipeline: [
                        {
                            $match: { user_id, deleted: false }
                        },
                        {
                            $lookup: {
                                from: "permissions",
                                localField: "permission_id",
                                foreignField: "_id",
                                as: "permissionDetails"
                            }
                        },
                        { $unwind: "$permissionDetails" },
                        {
                            $match: { "permissionDetails.deleted": false }
                        },
                        {
                            $project: {
                                _id: 0,
                                action: "$permissionDetails.action"
                            }
                        }
                    ]
                }
            },
            {
                $group: {
                    _id: null,
                    list: { $addToSet: "$action" }
                }
            },
            {
                $project: {
                    _id: 0,
                    list: 1
                }
            }
        ]);

        return result.length ? result[0].list : [];
    } catch (error) {
        // console.log(error.message)
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
};

export const formatWord = async (string) => {
    return await string.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export const generatePlainPassword = () => {
    const length = 8; // Fixed base length to ensure final length doesn't exceed 12
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const specialChars = "!@#$%^&*()-_=+<>?";

    // Ensure at least one character from each required set
    let password = "";
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    // Fill remaining characters with a mix of all sets
    const allChars = lowercase + uppercase + numbers + specialChars;
    while (password.length < length) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password to avoid predictable patterns
    password = password.split("").sort(() => 0.5 - Math.random()).join("");

    // Append last 2 digits of the current timestamp to ensure uniqueness
    const timestamp = Date.now().toString().slice(-2); // Get last 2 digits
    return password + timestamp; // Ensures final length is exactly 10 characters
}

export const getAssignedProjectsList = async (userId) => {
    return await Projects.find(
        { users_id: userId },
        { _id: 1, name: 1 }
    ).sort({ _id: -1 });
}

export const getReporintgToList = async (userId) => {
    return await User.find(
        { reporting_to: userId },
        { _id: 1, first_name: 1, last_name: 1 }
    ).sort({ _id: -1 });  
}


