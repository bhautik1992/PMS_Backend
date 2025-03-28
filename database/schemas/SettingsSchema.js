import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    emp_code: { 
        type: String, 
        required: true, 
        maxLength: 6
    },
    deletedAt: {
        type: Date,
        default: null
    }
},{
    timestamps: true
});

export default schema;
