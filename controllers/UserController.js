import User from '../models/User.js';
import BankDetails from '../models/BankDetails.js';
import Permissions from '../models/Permissions.js';
import UserPermissions from '../models/UserPermissions.js';
import { successResponse, errorResponse } from '../helpers/ResponseHandler.js';
import { getPermissionsByRole } from '../helpers/Common.js';

const selectFields = "first_name last_name middle_name username employee_code is_active";

export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select(selectFields);
        successResponse(res, users, 200, "Users Fetch Successfully");
    } catch (error) {
        errorResponse(res,process.env.ERROR_MSG,error,500);
    }
};

export const createUser = async (req, res) => {
    try {
        const { personalInfo, addressInfo, companyInfo, bankInfo } = req.body;
        const mergedInfo = { ...personalInfo, ...addressInfo, ...companyInfo };
        
        let object1 = {
            ...mergedInfo,
            designation_id:mergedInfo.designation_id.value,
            role_id:mergedInfo.role_id.value,
        }
        const user = await new User(object1).save();

        let object2 = {
            ...bankInfo,
            user_id:user._id,
            bank_id:bankInfo.bank_id.value,
            account_type:bankInfo.account_type.value,
        }
        await new BankDetails(object2).save()
        
        successResponse(res, {}, 200, 'Employee Created Successfully');
    } catch (error) {
        // console.log(error.message)
        errorResponse(res,process.env.ERROR_MSG,error,500);
    }
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

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
        if (!updatedUser) {
            return errorResponse(res, "User not found!", null, 404);
        }

        const object  = updatedUser.toObject();
        delete object.password;

        successResponse(res, object, 200, "Profile Updated Successfully");
    } catch (error) {
        console.log(error.message)
        errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
};

export const changePassword = async (req, res) => {
    try {
        const { userId } = req.params;
        const updateData = { ...req.body };
        
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
        if(!updatedUser){
            return errorResponse(res, "User not found!", null, 404);
        }
        
        successResponse(res, {}, 200, "Password Updated Successfully");
    } catch (error) {
        // error.message
        if (error.message === "User not found!") {
            return errorResponse(res, "User not found!", null, 404);
        }
        
        if (error.message === "Current password is incorrect.") {
            return errorResponse(res, "Current password is incorrect.", null, 400);
        }

        errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
};

export const getBankDetails = async (req, res) => {
    try{
        const { userId } = req.params;
        
        const bankDetail = await BankDetails.findOne({ user_id: userId });
        if(!bankDetail){
            return errorResponse(res, "Bank details not found!", null, 404);
        }
        
        successResponse(res, bankDetail, 200, "Bank details fetch successfully");
    }catch(error){
        // error.message
        errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const handleUserPermission = async (req, res) => {
    try{
        const { userId } = req.params;
        const user = await User.findById(userId);

        const permissions     = await Permissions.find().sort({ _id: -1 });
        const rolePermissions = await getPermissionsByRole(user.role_id);
        const userPermissions = await UserPermissions.find({user_id: userId});

        successResponse(res, { permissions, role_permissions:  rolePermissions, user_permissions: userPermissions, user_id: userId});
    }catch(error){
        // error.message
        errorResponse(res, process.env.ERROR_MSG, error, 500);
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

        successResponse(res, {}, 200, 'Permissions assigned successfully');
    } catch (error) {
        // console.log(error.message)
        errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const generateEmployeeCode = async (req, res) => {
    try {
        let { prefix } = req.query;

        const user = await User.findOne({}, { employee_code: 1, _id: 0 }).sort({ createdAt: -1 }).lean(); 
        let nextCode = `${prefix}0001`;

        if (user && user.employee_code) {
            const regex = new RegExp(`^${prefix}(\\d+)$`);
            const match = user.employee_code.match(regex);

            if (match) {
                const nextNumber = String(parseInt(match[1], 10) + 1).padStart(4, '0');
                nextCode = `${prefix}${nextNumber}`;
            }
        }

        successResponse(res, {emp_code: nextCode}, 200, '');
    } catch (error) {
        // console.log(error.message)
        errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}


