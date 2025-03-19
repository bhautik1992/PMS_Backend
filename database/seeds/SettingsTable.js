import mongoose from 'mongoose';
import Settings from '../../models/Settings.js';
import connectDB from '../../config/database.js';

export const settingTable = async () => {
    try {
        await connectDB();

        const settingskDetails = [{
            emp_code : 'HS',
        }];

        for (const details of settingskDetails) {
            const obj = new Settings(details);
            await obj.save();
        }

        mongoose.connection.close();
    } catch (error) {
        // console.error('Error during seeding:', error);
        mongoose.connection.close();
    }
};


