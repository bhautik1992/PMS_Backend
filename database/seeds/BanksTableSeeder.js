import mongoose from 'mongoose';
import Banks from '../../models/Banks.js';
import connectDB from '../../config/database.js';

export const banksTable = async () => {
    try {
        await connectDB();

        const object = [{
            name : 'HDFC',
        },{
            name : 'ICICI',
        },{
            name : 'Axios',
        }];

        await Banks.insertMany(object); 
        mongoose.connection.close();
    } catch (error) {
        // console.error('Error during seeding:', error);
        mongoose.connection.close();
    }
};


