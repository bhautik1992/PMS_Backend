import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";

const schema = new mongoose.Schema({
    project_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Projects', 
        required: true,
    },
    task_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Tasks', 
        required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    hours: {
        type: Number,
        required: true,
        max: 999
    },
    description: {
        type: String, 
        required: false,
    },
    deletedAt: {
        type: Date,
        default: null
    }
},{
    timestamps: true,
    collection: "time_entries",
});

schema.plugin(mongooseDelete, { 
    deletedAt: true, // Adds deletedAt field
    overrideMethods: "all",  // Ensures soft-deleted records are hidden from normal queries
    deletedBy: false, // Optionally store the user who deleted the record
});


export default schema;


