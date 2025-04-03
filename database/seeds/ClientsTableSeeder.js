import mongoose from 'mongoose';
import Clients from '../../models/Clients.js';
import connectDB from '../../config/database.js';

export const clientsTable = async () => {
    try {
        await connectDB();

        const object = [{
            first_name: 'Internal',
            email     : 'internal.hailysoft@gmail.com',
            country   : 'India',
        }];

        await Clients.insertMany(object);
        mongoose.connection.close();
    } catch (error) {
        // console.error('Error during seeding:', error);
        mongoose.connection.close();
    }
};


