import RolePermissions from '../models/RolePermissions.js';
import {successResponse, errorResponse} from './ResponseHandler.js';

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
        errorResponse(res, process.env.ERROR_MSG, error, 500);
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
        errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
};


