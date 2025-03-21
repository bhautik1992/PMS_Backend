import mongoose from 'mongoose';
import Designation from '../../models/Designation.js';
import connectDB from '../../config/database.js';

export const designationTable = async () => {
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
            name : 'CEO',
        }];

        await Designation.insertMany(object); 
        mongoose.connection.close();
    } catch (error) {
        // console.error('Error during seeding:', error);
        mongoose.connection.close();
    }
};


