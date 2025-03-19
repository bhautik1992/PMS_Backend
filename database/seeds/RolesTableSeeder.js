import mongoose from 'mongoose';
import Roles from '../../models/Roles.js';
import connectDB from '../../config/database.js';

export const rolesTable = async () => {
    try {
        await connectDB();

        const object = [{
            name : 'Trainee',
        },{
            name : 'Junior Developer',
        },{
            name : 'Senior Developer',
        },{
            name : 'Team Leader',
        },{
            name : 'Project Manager',
        },{
            name: 'Admin'
        }];

        for (const value of object) {
            const roles = new Roles(value);
            await roles.save();
        }

        mongoose.connection.close();
    } catch (error) {
        // console.error('Error during seeding:', error);
        mongoose.connection.close();
    }
};


