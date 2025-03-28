import mongoose from 'mongoose';
import mongooseDelete from "mongoose-delete";

const schema = new mongoose.Schema({
    role_id : {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Roles', 
        required: true,
    },
    permission_id : {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Permissions', 
        required: true,
    },
    deletedAt: {
        type: Date,
        default: null
    }
},{
    timestamps: true,
    collection: "role_permissions"
})

schema.plugin(mongooseDelete, { 
    deletedAt: true, // Adds deletedAt field
    overrideMethods: "all",  // Ensures soft-deleted records are hidden from normal queries
    deletedBy: false, // Optionally store the user who deleted the record
});

export default schema;

