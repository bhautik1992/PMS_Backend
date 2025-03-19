import mongoose from 'mongoose';

const schema =  new mongoose.Schema({
    user_id         : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bank_name       : { type: String, required: true, maxLength: 50 },
    account_number  : { type: String, required: true, maxLength: 20, unique: true },
    ifsc_code       : { type: String, required: true, maxLength: 15 },
    branch_name     : { type: String, required: true, maxLength: 40 },
    account_type    : { type: String, enum: ['savings', 'current'], default: 'savings', required: true },
    aadhar_card     : { type: String, required: true, maxLength: 12 },
    pan_card        : { type: String, required: true, maxLength: 10 },
    deletedAt       : { type: Date, default: null},
},{ 
    timestamps: true,
    collection: "bank_details"
});

export default schema;


