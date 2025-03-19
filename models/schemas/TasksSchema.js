import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";

const schema = new mongoose.Schema({
    project_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Projects', 
        required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
    },
    hours: {
        type: Number,
        required: true,
        max: 999
    },
    start_date: {
        type: Date,
        required: true,
    },
    end_date: {
        type: Date,
        required: true,
    },
    name: {
        type: String,
        required: true,
        maxLength: 200,
    },
    description: {
        type: String, 
        required: true,
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    }
},{
    timestamps: true,
});

schema.plugin(mongooseDelete, { 
    deletedAt: true, // Adds deletedAt field
    overrideMethods: "all",  // Ensures soft-deleted records are hidden from normal queries
    deletedBy: true, // Optionally store the user who deleted the record
});

// schema.set("toJSON", {
//     transform: function (doc, ret, options) {
//         if (ret.start_date) {
//             // Format start_date
//             ret.start_date = new Date(ret.start_date).toLocaleDateString("en-GB", {
//                 day: "2-digit",
//                 month: "short",
//                 year: "numeric",
//             }).replace(/(\d{2}) (\w{3}) (\d{4})/, '$1 $2, $3');
//         }

//         if (ret.end_date) {
//             // Format end_date
//             ret.end_date = new Date(ret.end_date).toLocaleDateString("en-GB", {
//                 day: "2-digit",
//                 month: "short",
//                 year: "numeric",
//             }).replace(/(\d{2}) (\w{3}) (\d{4})/, '$1 $2, $3');
//         }

//         if (ret.hours || ret.hours === 0) {
//             ret.hours = `${ret.hours}:00`;
//         }

//         return ret;
//     },
// });

schema.virtual('ymd_start_date').get(function () {
    return this.start_date ? this.start_date.toISOString().split("T")[0] : null;
});

schema.virtual('ymd_end_date').get(function () {
    return this.end_date ? this.end_date.toISOString().split("T")[0] : null;
});

// Ensure virtuals are included in JSON response
schema.set('toJSON', { virtuals: true });
schema.set('toObject', { virtuals: true });


export default schema;


