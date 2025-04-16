import User from '../models/User.js';
import BankDetails from '../models/BankDetails.js';
import Permissions from '../models/Permissions.js';
import Settings from '../models/Settings.js';
import UserPermissions from '../models/UserPermissions.js';
import { successResponse, errorResponse } from '../helpers/ResponseHandler.js';
import { getPermissionsByRole } from '../helpers/Common.js';
import { validateUniqueBankDetails } from './BankDetailsController.js';
import { formatWord } from '../helpers/Common.js';
import mongoose from 'mongoose';
import moment from 'moment';
import { passwordEmail } from '../helpers/SendEmail.js';
import { generatePlainPassword } from '../helpers/Common.js';

export const getUsers = async (req, res) => {
    try {
        const users = await User.aggregate([
            {
                $lookup: {
                    from: "roles",
                    localField: "role_id",
                    foreignField: "_id",
                    as: "role"
                }
            },
            { $unwind: "$role" },
            {
                $lookup: {
                    from: "designations",
                    localField: "designation_id",
                    foreignField: "_id",
                    as: "designation"
                }
            },
            { $unwind: "$designation" },
            {
                $lookup: {
                    from: "users", // self-reference
                    localField: "reporting_to",
                    foreignField: "_id",
                    as: "reporting_user"
                }
            },
            { $unwind: { path: "$reporting_user", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "designations",
                    localField: "reporting_user.designation_id",
                    foreignField: "_id",
                    as: "reporting_user_designation"
                }
            },
            { $unwind: { path: "$reporting_user_designation", preserveNullAndEmptyArrays: true } },

            // {
            //     $match: { "role.name": { $ne: "Admin" } }
            // },
            {
                $project: {
                    first_name: 1,
                    last_name: 1,
                    middle_name: 1,
                    username: 1,
                    employee_code: 1,
                    company_email: 1,
                    mobile_number: 1,
                    city: 1,
                    is_active: 1,
                    role_id: {
                        _id: "$role._id",
                        name: "$role.name"
                    },
                    designation_id: {
                        _id: "$designation._id",
                        name: "$designation.name"
                    },
                    reporting_to: {
                        _id: "$reporting_user._id",
                        first_name: "$reporting_user.first_name",
                        last_name: "$reporting_user.last_name",
                        designation: {
                            _id: "$reporting_user_designation._id",
                            name: "$reporting_user_designation.name"
                        }
                    }
                }
            },
            { $sort: { _id: -1 } }
        ]);    

        return successResponse(res, users, 200, "Collaborator Fetch Successfully");
    } catch (error) {
        // console.log(error.message)
        return errorResponse(res,process.env.ERROR_MSG,error,500);
    }
};

export const createUser = async (req, res) => {
    try {
        const { personalInfo, addressInfo, companyInfo, bankInfo } = req.body;
        const mergedInfo = { ...personalInfo, ...addressInfo, ...companyInfo };

        // Check for users
        const query1 = [];
        if (mergedInfo?.username?.trim()) query1.push({ username: mergedInfo.username.trim() });
        if (mergedInfo?.employee_code?.trim()) query1.push({ employee_code: mergedInfo.employee_code.trim() });
        if (mergedInfo?.company_email?.trim()) query1.push({ company_email: mergedInfo.company_email.trim() });
        if (mergedInfo?.personal_email?.trim()) query1.push({ personal_email: mergedInfo.personal_email.trim() });

        const exiUser = query1.length > 0 ? await User.findOne({ $or: query1, deletedAt: null }).lean() : null;        
        let userError = await validateUniqueUsersDetails(exiUser,mergedInfo);
        if(userError !== ''){
            return errorResponse(res, userError, null, 404);
        }
        //

        // Check for bank details
        const query2 = [];
        if (bankInfo?.account_number?.trim()) query2.push({ account_number: bankInfo.account_number.trim() });
        if (bankInfo?.aadhar_card?.trim()) query2.push({ aadhar_card: bankInfo.aadhar_card.trim() });
        if (bankInfo?.pan_card?.trim()) query2.push({ pan_card: bankInfo.pan_card.trim() });

        const exiBankDetails = query2.length > 0 ? await BankDetails.findOne({ $or: query2, deletedAt: null }).lean() : null;
        let bankError = await validateUniqueBankDetails(exiBankDetails, bankInfo);
        if(bankError !== ''){
            return errorResponse(res, bankError, null, 404);
        }
        //

        const employee_code = await generateEmployeeCode();
        const plainPassword = generatePlainPassword();

        let object1 = {
            ...mergedInfo,
            shift_time    : mergedInfo.shift_time.value,
            designation_id: mergedInfo.designation_id.value,
            role_id       : mergedInfo.role_id.value,
            reporting_to  : mergedInfo.reporting_to.value,
            birth_date    : moment(mergedInfo.birth_date, "DD-MM-YYYY").format("YYYY-MM-DD"),
            password      :plainPassword,
            employee_code
        }
        const user = await new User(object1).save();

        let object2 = {
            ...bankInfo,
            user_id     : user._id,
            bank_id     : bankInfo?.bank_id?.value,
            account_type: bankInfo?.account_type?.value || null,
        }
        await new BankDetails(object2).save();
        
        process.env.APP_ENV == 'production' && await passwordEmail(user,plainPassword);
        return successResponse(res, {}, 200, 'Collaborator Created Successfully');
    } catch (error) {
        // console.log(error.message)
        if(error.code === 11000){
            const field          = Object.keys(error.keyPattern)[0];
            const formattedField = await formatWord(field);

            return errorResponse(res, `${formattedField} already exists. Please use a different one.`, 400);
        }

        return errorResponse(res,process.env.ERROR_MSG,error,500);
    }
}

export const validateUniqueUsersDetails = async (existingRecord, newRecord) => {
    let errorMessage = "";

    if (existingRecord) {
        if (existingRecord.username === newRecord?.username?.trim()) {
            errorMessage = 'User Name is already exists.';
        } else if (existingRecord.employee_code === newRecord?.employee_code?.trim()) {
            errorMessage = 'Collaborator Code is already exists.';
        } else if (existingRecord.company_email === newRecord?.company_email?.trim()) {
            errorMessage = 'Company Email is already exists.';
        } else if (existingRecord.personal_email === newRecord?.personal_email?.trim()) {
            errorMessage = 'Personal Email is already exists.';
        }
    }

    return errorMessage;
}

export const updateProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const updateData = { ...req.body };
        
        if(req.file){
            updateData.profile_photo = `${req.file.destination}/${req.file.filename}`;
        }else{
            delete updateData.profile_photo
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).populate('role_id', 'name').populate('designation_id','name');
        if (!updatedUser) {
            return errorResponse(res, "Collaborator not found!", null, 404);
        }

        const object  = updatedUser.toObject();
        delete object.password;

        return successResponse(res, object, 200, "Profile Updated Successfully");
    } catch (error) {
        // console.log(error.message)
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
};

export const changePassword = async (req, res) => {
    try {
        const { userId } = req.params;
        const updateData = { ...req.body };
        
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
        if(!updatedUser){
            return errorResponse(res, "Collaborator not found!", null, 404);
        }
        
        return successResponse(res, {}, 200, "Password Updated Successfully");
    } catch (error) {
        // error.message
        if (error.message === "User not found!") {
            return errorResponse(res, "User not found!", null, 404);
        }
        
        if (error.message === "Current password is incorrect.") {
            return errorResponse(res, "Current password is incorrect.", null, 400);
        }

        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
};

export const getBankDetails = async (req, res) => {
    try{
        const { userId } = req.params;
        
        const bankDetail = await BankDetails.findOne({ user_id: userId }).populate({
            path: "bank_id",
            select: "name"
        });
                
        if(!bankDetail){
            return errorResponse(res, "Bank details not found!", null, 404);
        }
        
        return successResponse(res, bankDetail, 200, "Bank details fetch successfully");
    }catch(error){
        // error.message
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const handleUserPermission = async (req, res) => {
    try{
        const { userId } = req.params;
        const user = await User.findById(userId);

        const permissions     = await Permissions.find().sort({ _id: -1 });
        const rolePermissions = await getPermissionsByRole(user.role_id);
        const userPermissions = await UserPermissions.find({user_id: userId});

        return successResponse(res, { permissions, role_permissions:  rolePermissions, user_permissions: userPermissions, user_id: userId});
    }catch(error){
        // error.message
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const assignPermissions = async (req, res) => {
    try {
        const { userId, selectedPermissions } = req.body;

        const existingPermissions = await UserPermissions.find({ user_id: userId });
        const existingPermissionIds = existingPermissions.map(p => p.permission_id.toString());

        const permissionsToAdd = selectedPermissions.filter(id => !existingPermissionIds.includes(id));
        const permissionsToRemove = existingPermissionIds.filter(id => !selectedPermissions.includes(id));
        
        const newPermissions = permissionsToAdd.map(permissionId => ({
            user_id: userId,
            permission_id: permissionId
        }));

        if (newPermissions.length > 0) {
            await UserPermissions.insertMany(newPermissions);
        }

        if (permissionsToRemove.length > 0) {
            await UserPermissions.delete({ user_id: userId, permission_id: { $in: permissionsToRemove } });
        }

        return successResponse(res, {}, 200, 'Permissions assigned successfully');
    } catch (error) {
        // console.log(error.message)
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const generateEmployeeCode = async (req = null, res = null) => {
    try {
        let settings = await Settings.findOne();
        const prefix = settings.emp_code;

        const user = await User.findOneWithDeleted({}, { employee_code: 1, _id: 0 }).sort({ createdAt: -1 }).lean();
        let nextCode = `${prefix}0001`;

        if (user && user.employee_code) {
            const regex = new RegExp(`^${prefix}(\\d+)$`);
            const match = user.employee_code.match(regex);

            if (match) {
                const nextNumber = String(parseInt(match[1], 10) + 1).padStart(4, '0');
                nextCode = `${prefix}${nextNumber}`;
            }
        }

        if(req && res){
            return successResponse(res, {emp_code: nextCode}, 200, '');
        }else{
            return nextCode;
        }
    } catch (error) {
        // console.log(error.message)
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const edit = async (req, res) => {
    try{
        const { id } = req.params;
        
        if(!mongoose.Types.ObjectId.isValid(id)){
            return errorResponse(res, process.env.NO_RECORD, null, 400);
        }

        const user = await User.findById(id);
        if(!user) {
            return errorResponse(res, process.env.NO_RECORD, null, 404);
        }

        const bankDetail = await BankDetails.findOne({'user_id':user._id});
        return successResponse(res, {user, bank_detail: bankDetail}, 200, '');
    } catch (error) {
        // console.log(error.message);
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const update = async (req, res) => {
    try {
        const { personalInfo, addressInfo, companyInfo, bankInfo, userId } = req.body;
        const mergedInfo = { ...personalInfo, ...addressInfo, ...companyInfo };

        // Check for users
        const query1 = [];
        if (mergedInfo?.username?.trim()) query1.push({ username: mergedInfo.username.trim() });
        if (mergedInfo?.employee_code?.trim()) query1.push({ employee_code: mergedInfo.employee_code.trim() });
        if (mergedInfo?.company_email?.trim()) query1.push({ company_email: mergedInfo.company_email.trim() });
        if (mergedInfo?.personal_email?.trim()) query1.push({ personal_email: mergedInfo.personal_email.trim() });

        const queryFilter1 = { $or: query1 };
        if(userId) {
            queryFilter1._id = { $ne: userId };
        }

        const exiUser = query1.length > 0 ? await User.findOne(queryFilter1).lean() : null;        
        let userError = await validateUniqueUsersDetails(exiUser,mergedInfo);
        if(userError !== ''){
            return errorResponse(res, userError, null, 404);
        }
        //

        // Check for bank details
        const query2 = [];
        if (bankInfo?.account_number?.trim()) query2.push({ account_number: bankInfo.account_number.trim() });
        if (bankInfo?.aadhar_card?.trim()) query2.push({ aadhar_card: bankInfo.aadhar_card.trim() });
        if (bankInfo?.pan_card?.trim()) query2.push({ pan_card: bankInfo.pan_card.trim() });

        const queryFilter2 = { $or: query2 };
        if(userId) {
            queryFilter2.user_id = { $ne: userId };
        }

        const exiBankDetails = query2.length > 0 ? await BankDetails.findOne(queryFilter2).lean() : null;
        let bankError = await validateUniqueBankDetails(exiBankDetails, bankInfo);
        if(bankError !== ''){
            return errorResponse(res, bankError, null, 404);
        }
        //

        let object1 = {
            ...mergedInfo,
            ...(mergedInfo.shift_time?.value && { shift_time: mergedInfo.shift_time.value }),
            ...(mergedInfo.designation_id?.value && { designation_id: mergedInfo.designation_id.value }),
            ...(mergedInfo.role_id?.value && { role_id: mergedInfo.role_id.value }),
            ...(mergedInfo.reporting_to?.value && { reporting_to: mergedInfo.reporting_to.value }),
            ...(mergedInfo.birth_date && { birth_date: moment(mergedInfo.birth_date, "DD-MM-YYYY").format("YYYY-MM-DD") }),
        }
        await User.findByIdAndUpdate(userId, object1, { new: true });

        let object2 = {
            ...bankInfo,
            user_id:userId,
            ...(bankInfo?.bank_id?.value && { bank_id: bankInfo.bank_id.value }),
            ...(bankInfo?.account_type?.value && { account_type: bankInfo.account_type.value }),
        }
        
        Object.keys(object2).forEach(key => {
            if (object2[key] === '') {
                delete object2[key];
            }
        });

        await BankDetails.findOneAndUpdate({ user_id: userId },object2,{ new: true });

        return successResponse(res, {}, 200, 'Collaborator Updated Successfully');
    } catch (error) {
        // console.log(error.message)
        return errorResponse(res,process.env.ERROR_MSG,error,500);
    }
}

export const destroy = async (req, res) => {
    try {
        const { id } = req.body;
        
        await User.delete({_id:id})
        await BankDetails.delete({'user_id':id})
        return successResponse(res, {}, 200, "Collaborator Deleted Successfully");
    }catch(error){
        // error.message
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}


