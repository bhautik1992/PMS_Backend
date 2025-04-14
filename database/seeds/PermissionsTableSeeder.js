import mongoose from 'mongoose';
import Permissions from '../../models/Permissions.js';
import connectDB from '../../config/database.js';

export const permissionsTable = async () => {
    try {
        await connectDB();

        const object = [{
            name : 'Dashboard',
            action: 'dashboard',
        },{
            name : 'Settings',
            action: 'settings',
        },{
            name : 'Profile',
            action: 'profile',
        },{
            name : 'Account',
            action: 'account',
        },{
            name : 'Security',
            action: 'security',
        },{
            name : 'Bank Details',
            action: 'bank_details',
        },{
            name : 'Roles',
            action: 'roles',
        },{
            name : 'Role Create',
            action: 'role_create',
        },{
            name : 'Role Edit',
            action: 'role_edit',
        },{
            name : 'Role Delete',
            action: 'role_delete',
        },{
            name : 'Role Permissions',
            action: 'role_permissions',
        },{
            name : 'Permissions',
            action: 'permissions',
        },{
            name : 'Permission Create',
            action: 'permission_create',
        },{
            name : 'Permission Edit',
            action: 'permission_edit',
        },{
            name : 'Permission Delete',
            action: 'permission_delete',
        },{
            name : 'Projects',
            action: 'projects',
        },{
            name : 'Project Create',
            action: 'project_create',
        },{
            name : 'Project Edit',
            action: 'project_edit',
        },{
            name : 'Project Delete',
            action: 'project_delete',
        },{
            name : 'Project View',
            action: 'project_view',
        },{
            name : 'Tasks',
            action: 'tasks',
        },{
            name : 'Task Create',
            action: 'task_create',
        },{
            name : 'Task Edit',
            action: 'task_edit',
        },{
            name : 'Task Delete',
            action: 'task_delete',
        },{
            name : 'Task View',
            action: 'task_view',
        },{
            name : 'Task Time Entry',
            action: 'task_time_entry',
        },{
            name : 'Time Entry',
            action: 'time_entry',
        },{
            name : 'Time Create',
            action: 'time_entry_create',
        },{
            name : 'Time Edit',
            action: 'time_entry_edit',
        },{
            name : 'Time Delete',
            action: 'time_entry_delete',
        },{
            name : 'Time View',
            action: 'time_entry_view',
        },{
            name : 'Employee',
            action: 'employee',
        },{
            name : 'Employee Create',
            action: 'employee_create',
        },{
            name : 'Employee Edit',
            action: 'employee_edit',
        },{
            name : 'Employee Delete',
            action: 'employee_delete',
        },{
            name : 'Employee View',
            action: 'employee_view',
        },{
            name : 'Employee Permissions',
            action: 'employee_permissions',
        },{
            name : 'Clients',
            action: 'clients',
        },{
            name : 'Client Create',
            action: 'client_create',
        },{
            name : 'Client Edit',
            action: 'client_edit',
        },{
            name : 'Client Delete',
            action: 'client_delete',
        },{
            name : 'Client View',
            action: 'client_view',
        },{
            name : 'Holidays',
            action: 'holidays',
        },
        ,{
            name : 'Holiday Create',
            action: 'holiday_create',
        },
        ,{
            name : 'Holiday Edit',
            action: 'holiday_edit',
        },
        ,{
            name : 'Holiday Delete',
            action: 'holiday_delete',
        },
        ,{
            name : 'Countries',
            action: 'countries',
        },
        ,{
            name : 'Country Create',
            action: 'country_create',
        },
        ,{
            name : 'Country Edit',
            action: 'country_edit',
        },
        ,{
            name : 'Country Delete',
            action: 'country_delete',
        }];

        for (const value of object) {
            const permission = new Permissions(value);
            await permission.save();
        }

        mongoose.connection.close();
    } catch (error) {
        // console.error('Error during seeding:', error);
        mongoose.connection.close();
    }
};


