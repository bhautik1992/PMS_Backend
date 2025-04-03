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
            "bank_details",
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
            "project_create",
            "project_edit",
            "project_delete",
            "project_view",
            "tasks",
            "task_create",
            "task_edit",
            "task_delete",
            "task_view",
            "task_time_entry",
            "time_entry",
            "time_entry_create",
            "time_entry_edit",
            "time_entry_delete",
            "time_entry_view",
            "employee",
            "employee_create",
            "employee_edit",
            "employee_delete",
            "employee_view",
            "employee_permissions",
        ];
        const role = await Roles.findOne();
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


