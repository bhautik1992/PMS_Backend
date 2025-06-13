import mongoose from 'mongoose';
import mongooseDelete from "mongoose-delete";
import { type } from 'os';

const schema = new mongoose.Schema({
    emp_code: { 
        type: String, 
        required: true, 
        maxLength: 6
    },
    linkedin_url: { 
        type: String, 
        required: true, 
        maxLength: 50
    },
    twitter_url: { 
        type: String, 
        required: true, 
        maxLength: 50
    },
    open_days: { 
        type: Number,
        required: true,
        maxLength: 1
    },
    company_image : {
        type : String,
    },
    deletedAt: {
        type: Date,
        default: null
    },
   total_leaves: {
    type: Number,
    required: true,
    min: 0,
    max: 365
},
},{
    timestamps: true
});

schema.plugin(mongooseDelete, { 
    deletedAt: true, // Adds deletedAt field
    overrideMethods: "all",  // Ensures soft-deleted records are hidden from normal queries
    deletedBy: false, // Optionally store the user who deleted the record
});

export default schema;


