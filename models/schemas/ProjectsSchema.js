import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    name: {
        type: String, 
        required: true, 
        maxLength: 50
    },
    type: { 
        type: String, 
        enum: ['hourly', 'fixed-cost'], 
        required: true 
    },
    start_date: {
        type: Date,
        required: true,
    },
    end_date: {
        type: Date,
        required: true,
    },
    users_id: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    }],
    status:{
        type: String,
        enum: ['active', 'hold', 'closed'],
        default: 'active',
        required: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    },
    deletedAt: {
        type: Date,
        default: null
    }
},{
    timestamps: true,
})

export default schema;


