import mongoose from 'mongoose';
import Roles from '../../models/Roles.js';
import Permissions from '../../models/Permissions.js';
import RolePermissions from '../../models/RolePermissions.js';
import connectDB from '../../config/database.js';

export const rolePermissionsTable = async () => {
    try {
        await connectDB();

        const actions = [
            "dashboard",
            "settings",
            "profile",
            "account",
            "security",
            "roles",
            "role_create",
            "role_edit",
            "role_delete",
            "role_permissions",
            "permissions",
            "permission_create",
            "permission_edit",
            "permission_delete",
            "projects",
            "tasks",
            "employee",
            "employee_permissions",
        ];
        const role = await Roles.findOne({ name: "Admin" });
        const permissions = await Permissions.find({ action: { $in: actions } });

        for (const value of permissions) {
            const permission = new RolePermissions({
                role_id:role._id,
                permission_id:value._id
            });

            await permission.save();
        }

        mongoose.connection.close();
    } catch (error) {
        // console.error('Error during seeding:', error);
        mongoose.connection.close();
    }
};


