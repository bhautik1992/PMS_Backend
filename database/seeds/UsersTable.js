import mongoose from 'mongoose';
import User from '../../models/User.js';
import connectDB from '../../config/database.js';
import Roles from '../../models/Roles.js';
import Designation from '../../models/Designation.js';

export const usersTable = async () => {
    try {
        await connectDB();
        const role = await Roles.findOne({ name: "Admin" });
        const designation = await Designation.findOne({ name: "CEO" });

        const defaultUsers = [{
            role_id                :  role._id,
            first_name             : 'Bhautik',
            last_name              : 'Ajmera',
            middle_name            : 'Shaileshbhai',
            username               : 'bhautik1992',
            employee_code          : 'HS0001',
            password               : 'Bhautik1992!',
            profile_photo          :  null,       
            company_email          : 'bhautik.hailysoft@gmail.com',
            personal_email         : 'ajmera.bhautik@gmail.com',
            designation_id         :  designation._id,
            permanent_address      : 'Vandemataram Circle, Gota',
            temporary_address      :  null,
            mobile_number          : '9033357408',
            alternate_mobile_number: '9033458791',
            emergency_contact      : '9427747413',
            gender                 : 'male',
            city                   : 'Ahmedabad',
            state                  : 'Gujarat',
            country                : 'India'
        }];

        for (const userData of defaultUsers) {
            const user = new User(userData);
            await user.save();
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error during seeding:', error);
        mongoose.connection.close();
    }
};


