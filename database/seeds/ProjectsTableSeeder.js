import mongoose from 'mongoose';
import Projects from '../../models/Projects.js';
import Clients from '../../models/Clients.js';
import User from '../../models/User.js';
import connectDB from '../../config/database.js';

export const projectsTable = async () => {
    try {
        await connectDB();

        const client = await Clients.findOne();
        const user   = await User.findOne();
        
        const object = [{
            name         : 'Miscellaneous',
            type         : 'hourly',
            price        : '1',
            currency     : 'inr',
            billing_cycle: 'weekly',
            technology   : ['PHP'],
            start_date   : new Date(new Date().toISOString().split('T')[0] + "T00:00:00.000+00:00"),
            users_id     : [user._id],
            client_id    : client._id,
            created_by   : user._id,
        },{
            name         : 'Bench',
            type         : 'hourly',
            price        : '1',
            currency     : 'inr',
            billing_cycle: 'weekly',
            technology   : ['PHP'],
            start_date   : new Date(new Date().toISOString().split('T')[0] + "T00:00:00.000+00:00"),
            users_id     : [user._id],
            client_id    : client._id,
            created_by   : user._id,
        }];

        await Projects.insertMany(object);
        mongoose.connection.close();
    } catch (error) {
        // console.error('Error during seeding:', error);
        mongoose.connection.close();
    }
};


