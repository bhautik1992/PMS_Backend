import Permissions from '../models/Permissions.js';
import { getPermissionsByRole } from '../helpers/Common.js';
import { successResponse, errorResponse } from '../helpers/ResponseHandler.js';
import mongoose from 'mongoose';

export const index = async (req, res) => {
    try {
        const { page = 1, perPage = 10, search = "" } = req.query;
        const pageNumber    = parseInt(page, 10);
        const perPageNumber = parseInt(perPage, 10);

        const query = search ? { name: new RegExp(search, "i") } : {};

        const permissions = await Permissions.aggregate([
            { $match: query },
            { $sort: { _id: -1 } },
            { $skip: (pageNumber - 1) * perPageNumber },
            { $limit: perPageNumber },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    action: 1,
                    createdAt: {
                        $dateToString: { format: "%d %b, %Y", date: "$createdAt" }
                    }
                }
            }
        ]);

        const total = await Permissions.countDocuments(query);
        return successResponse(res, { permissions, total });
    } catch (error) {
        // console.log(error.message)
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
};

export const getAllPermissions = async (req, res) => {
    try {
        const { role_id }      = req.query;

        const permissions     = await Permissions.find().sort({ _id: -1 });
        const rolePermissions = await getPermissionsByRole(role_id);
        return successResponse(res, { permissions, role_permissions:  rolePermissions});
    } catch (error) {
        // console.log(error.message)
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const create = async (req, res) => {
    try {
        const { permissionId, name, action } = req.body;
        let message = 'Permission Created Successfully';

        const existingPermission = await Permissions.findOne({
            $or: [
                { name: { $regex: `^${name}$`, $options: "i" } },
                { action: { $regex: `^${action}$`, $options: "i" } }
            ],
            deletedAt: null,
            ...(permissionId && { _id: { $ne: permissionId } })
        });

        if (existingPermission) {
            return errorResponse(res, "Permission with this name or action already exists.", null, 400);
        }

        if (permissionId) {
            await Permissions.findByIdAndUpdate(permissionId, req.body, { new: true });
            message = 'Permission Updated Successfully';
        } else {
            const permission = new Permissions(req.body);
            await permission.save();
        }

        return successResponse(res, {}, 200, message);
    } catch (error) {
        // console.log(error.message)
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const edit = async (req, res) => {
    try{
        const { id } = req.params;
        
        if(!mongoose.Types.ObjectId.isValid(id)){
            return errorResponse(res, process.env.NO_RECORD, null, 400);
        }

        const permission = await Permissions.findById(id);
        if(!permission) {
            return errorResponse(res, process.env.NO_RECORD, null, 404);
        }
    
        return successResponse(res, permission, 200, '');
    } catch (error) {
        // console.log(error.message);
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const destroy = async (req, res) => {
    try {
        const { id } = req.body;
        
        await Permissions.delete({_id:id})
        return successResponse(res, {}, 200, "Permission Deleted Successfully");
    }catch(error){
        // error.message
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}


