import mongoose from 'mongoose';
import User from '../../models/User.js';
import connectDB from '../../config/database.js';
import Roles from '../../models/Roles.js';
import Designation from '../../models/Designation.js';

export const usersTable = async () => {
    try {
        await connectDB();
        const role          = await Roles.findOne({ name: "Admin" });
        const designation   = await Designation.findOne({ name: "CEO" });
        const userId        = new mongoose.Types.ObjectId();

        const object = [{
            _id                    :  userId,
            role_id                :  role._id,
            first_name             : 'Dhruvit',
            last_name              : 'Rajpura',
            middle_name            : 'G',
            birth_date             : new Date(new Date().toISOString().split('T')[0] + "T00:00:00.000+00:00"),
            username               : 'admin',
            employee_code          : 'HS0001',
            password               : 'tgd^TG23OK$d',
            profile_photo          :  null,
            company_email          : 'admin.hailysoft@gmail.com',
            personal_email         : 'admin.personal@gmail.com',
            designation_id         :  designation._id,
            reporting_to           :  userId,
            shift_time             : 'first_shift',
            permanent_address      : 'Ahmedabad',
            temporary_address      :  null,
            mobile_number          : '9000000001',
            alternate_mobile_number: '9000000002',
            emergency_contact      : '9000000003',
            gender                 : 'male',
            city                   : 'Ahmedabad',
            state                  : 'Gujarat',
            country                : 'India'
        }];

        for (const userData of object) {
            const user = new User(userData);
            await user.save();
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error during seeding:', error);
        mongoose.connection.close();
    }
};


