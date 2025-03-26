import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import mongooseDelete from "mongoose-delete";

const schema = new mongoose.Schema({
    role_id                : {type: mongoose.Schema.Types.ObjectId,ref: 'Roles',required: true},
    first_name             : { type: String, required : true, maxLength: 30 },
    last_name              : { type: String, required : true, maxLength: 30 }, 
    middle_name            : { type: String, required : true, maxLength: 30 },
    username  : { 
        type: String,
        required : true, 
        maxLength: 30, 
        unique: true, 
        sparse: true,
        set: v => v === "" ? undefined : v
    },
    employee_code  : { 
        type: String,
        required : true, 
        maxLength: 6, 
        unique: true, 
        sparse: true,
        set: v => v === "" ? undefined : v
    },
    password               : { type: String, default  : null, minLength: 8, maxLength: 12 },
    profile_photo          : { type: String, default  : null },
    company_email  : { 
        type: String,
        required : true, 
        maxLength: 50, 
        unique: true, 
        sparse: true,
        set: v => v === "" ? undefined : v
    },
    personal_email  : { 
        type: String,
        required : true, 
        maxLength: 50, 
        unique: true, 
        sparse: true,
        set: v => v === "" ? undefined : v
    },
    shift_time             : { type: String, enum: ['first_shift', 'second_shift'], required: true },
    designation_id         : { type: mongoose.Schema.Types.ObjectId,ref: 'Designation',required: true},
    permanent_address      : { type: String, required : true },
    temporary_address      : { type: String, default  : null },
    mobile_number          : { type: String, required : true, maxLength: 10 },
    alternate_mobile_number: { type: String, required : true, maxLength: 10 },
    emergency_contact      : { type: String, required : true, maxLength: 10 },
    gender                 : { type: String, enum: ['male', 'female'], required: true },
    city                   : { type: String, required : true, maxLength: 20 },
    state                  : { type: String, required : true, maxLength: 20 },
    country                : { type: String, required : true, maxLength: 20 },
    is_active              : { type: Boolean, default : 1, description : '0 = In-Active, 1 = Active' },
    deletedAt              : { type: Date, default: null},
},{
    timestamps: true
});

schema.plugin(mongooseDelete, { 
    deletedAt: true, // Adds deletedAt field
    overrideMethods: "all",  // Ensures soft-deleted records are hidden from normal queries
    deletedBy: false, // Optionally store the user who deleted the record
});

schema.pre('save', async function(next) {
    // Only hash the password if it's being modified or created
    if (!this.isModified('password')) return next();  

    try {
        const salt    = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

schema.pre("findOneAndUpdate", async function (next) {
    try {
        const update        = this.getUpdate();
        const fieldsToCheck = [
            // "profile_photo", 
            "temporary_address"
        ];

        fieldsToCheck.forEach((field) => {
            if (update[field] === "") {
                update[field] = null;
            }
        });

        if (update.new_password) {
            const user = await this.model.findOne(this.getQuery()).select("password");
            if(!user){
                return next(new Error("User not found!"));
            }
            
            const isMatch = await bcrypt.compare(update.current_password, user.password);
            if(!isMatch){
                return next(new Error("Current password is incorrect."));
            }

            const salt      = await bcrypt.genSalt(10);
            update.password = await bcrypt.hash(update.new_password, salt);
        }
        
        next();
    } catch (error) {
        return next(error);
    }
});

schema.methods.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

export default schema;


