import mongoose from 'mongoose';
import mongooseDelete from "mongoose-delete";

const schema =  new mongoose.Schema({
    user_id         : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bank_id         : { type: mongoose.Schema.Types.ObjectId, ref: 'Banks' },
    account_number  : { type: String, maxLength: 20, unique: true },
    ifsc_code       : { type: String, maxLength: 15 },
    branch_name     : { type: String, maxLength: 40 },
    account_type    : { type: String, enum: ['savings', 'current'], default: 'savings' },
    aadhar_card     : { type: String, maxLength: 12 },
    pan_card        : { type: String, maxLength: 10 },
    deletedAt       : { type: Date, default: null},
},{ 
    timestamps: true,
    collection: "bank_details"
});

schema.plugin(mongooseDelete, { 
    deletedAt: true, // Adds deletedAt field
    overrideMethods: "all",  // Ensures soft-deleted records are hidden from normal queries
    deletedBy: false, // Optionally store the user who deleted the record
});

export default schema;


