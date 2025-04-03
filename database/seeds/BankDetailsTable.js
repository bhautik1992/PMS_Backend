import mongoose from 'mongoose';
import User from '../../models/User.js';
import Banks from '../../models/Banks.js';
import BankDetails from '../../models/BankDetails.js';
import connectDB from '../../config/database.js';

export const bankDetailsTable = async () => {
    try {
        await connectDB();

        const user = await User.findOne();
        if (!user) {
            console.error("User not found! Please run the user seeder first.");
            mongoose.connection.close();
            return;
        }

        const bank = await Banks.findOne();
        if (!bank) {
            console.error("Bank not found! Please run the banks seeder first.");
            mongoose.connection.close();
            return;
        }

        const defaultBankDetails = [{
            user_id        : user._id,
            bank_id        : bank._id,
            account_number : "12345678901234",
            ifsc_code      : "HDFC0001111",
            branch_name    : "AHMEDABAD",
            aadhar_card    : "121212121212",
            pan_card       : "ABCDE1234F",
        }];

        for (const bankData of defaultBankDetails) {
            const bankDetail = new BankDetails(bankData);
            await bankDetail.save();
        }

        mongoose.connection.close();
    } catch (error) {
        // console.error('Error during seeding:', error);
        mongoose.connection.close();
    }
};

