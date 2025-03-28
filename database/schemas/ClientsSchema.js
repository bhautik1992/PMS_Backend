import mongoose from 'mongoose';
import mongooseDelete from "mongoose-delete";

const schema = new mongoose.Schema({
    first_name: { 
        type: String, 
        required : true, 
        maxLength: 30 
    },
    last_name: { 
        type: String, 
        default : null, 
        maxLength: 30
    },
    email: { 
        type: String,
        required : true, 
        maxLength: 50, 
        unique: true, 
        sparse: true,
        set: v => v === "" ? undefined : v
    },
    address: { 
        type: String, 
        default : null 
    },
    number: { 
        type: String, 
        default:null, 
        maxLength: 15 
    },
    country: { 
        type: String, 
        required : true, 
        maxLength: 20 
    },
    is_active: { 
        type: Boolean, 
        default : 1, 
        description : '0 = In-Active, 1 = Active' 
    },
    deletedAt: { type: Date, default: null},
},{
    timestamps: true
});

schema.plugin(mongooseDelete, { 
    deletedAt: true, // Adds deletedAt field
    overrideMethods: "all",  // Ensures soft-deleted records are hidden from normal queries
    deletedBy: false, // Optionally store the user who deleted the record
});

export default schema;


