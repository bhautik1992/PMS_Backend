import RolePermissions from '../models/RolePermissions.js';
import { successResponse, errorResponse } from '../helpers/ResponseHandler.js';

export const index = async (req, res) => {
    
}

export const assignPermissions = async (req, res) => {
    try {
        const { roleId, selectedPermissions } = req.body;

        const existingPermissions = await RolePermissions.find({ role_id: roleId });
        const existingPermissionIds = existingPermissions.map(p => p.permission_id.toString());

        const permissionsToAdd = selectedPermissions.filter(id => !existingPermissionIds.includes(id));
        const permissionsToRemove = existingPermissionIds.filter(id => !selectedPermissions.includes(id));
        
        const newPermissions = permissionsToAdd.map(permissionId => ({
            role_id: roleId,
            permission_id: permissionId
        }));

        if (newPermissions.length > 0) {
            await RolePermissions.insertMany(newPermissions);
        }

        if (permissionsToRemove.length > 0) {
            await RolePermissions.delete({ role_id: roleId, permission_id: { $in: permissionsToRemove } });
        }

        successResponse(res, {}, 200, 'Permissions assigned successfully');
    } catch (error) {
        // console.log(error.message)
        errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}


