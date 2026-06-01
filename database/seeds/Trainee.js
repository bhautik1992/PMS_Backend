import mongoose from 'mongoose';
import User from '../../models/User.js';
import connectDB from '../../config/database.js';
import Roles from '../../models/Roles.js';
import Designation from '../../models/Designation.js';
import dotenv from 'dotenv';
dotenv.config();

export const usersTable = async () => {
    try {
        await connectDB();
        const role          = await Roles.findOne({ name: "Senior Developer" });
        const designation   = await Designation.findOne({ name: "Senior Developer" });
        const userId        = new mongoose.Types.ObjectId();

        const object = [{
            _id                    :  userId,
            role_id                :  role._id,
            first_name             : 'Sammy',
            last_name              : 'Dave',
            middle_name            : 'R',
            birth_date             : new Date(new Date().toISOString().split('T')[0] + "T00:00:00.000+00:00"),
            username               : 'Sammy',
            employee_code          : 'HS0003',
            password               : 'S@umya12',
            profile_photo          :  null,
            company_email          : 'mcocsam9@gmail.com',
            personal_email         : 'mcocsam9@gmail.com',
            designation_id         :  designation._id,
            reporting_to           :  userId,
            shift_time             : 'first_shift',
            permanent_address      : 'Ahmedabad',
            temporary_address      :  null,
            mobile_number          : '9000000007',
            alternate_mobile_number: '9000000008',
            emergency_contact      : '9000000009',
            gender                 : 'male',
            city                   : 'Ahmedabad',
            state                  : 'Gujarat',
            country                : 'India'
        }];

        for (const userData of object) {
            const user = new User(userData);
            await user.save();
        }
        console.log("Seeder executed successfully!");
        mongoose.connection.close();
    } catch (error) {
        console.error('Error during seeding:', error);
        mongoose.connection.close();
    }
};

usersTable()

