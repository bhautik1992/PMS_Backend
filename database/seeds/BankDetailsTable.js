import mongoose from 'mongoose';
import User from '../../models/User.js';
import Banks from '../../models/Banks.js';
import BankDetails from '../../models/BankDetails.js';
import connectDB from '../../config/database.js';

export const bankDetailsTable = async () => {
    try {
        await connectDB();

        const user = await User.findOne({ company_email: "bhautik.hailysoft@gmail.com" });
        if (!user) {
            console.error("User not found! Please run the user seeder first.");
            mongoose.connection.close();
            return;
        }

        const bank = await Banks.findOne({ name: "HDFC" });
        if (!bank) {
            console.error("Bank not found! Please run the banks seeder first.");
            mongoose.connection.close();
            return;
        }

        const defaultBankDetails = [{
            user_id        : user._id,
            bank_id        : bank._id,
            account_number : "50100180248412",
            ifsc_code      : "HDFC0001683",
            branch_name    : "SAVARKUNDLA",
            aadhar_card    : "550186424459",
            pan_card       : "BCFPA7369L",
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

