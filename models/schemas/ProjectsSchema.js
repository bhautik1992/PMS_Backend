import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    name: {
        type: String, 
        required: true, 
        maxLength: 50
    },
    type: { 
        type: String, 
        enum: ['hourly', 'fixed-cost', 'monthly'], 
        required: true 
    },
    price: {
        type: Number,
        required: true
    },
    currency: { 
        type: String, 
        enum: ['usd', 'gbp', 'eur'], 
        required: true 
    },
    billing_cycle: { 
        type: String, 
        enum: ['weekly', 'monthly'], 
        required: true 
    },
    technology: {
        type: [String], 
        required: true
    },
    start_date: {
        type: Date,
        required: true,
    },
    end_date: {
        type: Date,
        default:null
    },
    users_id: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    }],
    description: {
        type: String, 
        default: null,
    },
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


