import mongoose from 'mongoose';
import schema from './schemas/UserPermissionsSchema.js';

const UserPermissions = mongoose.model('UserPermissionsSchema',schema);

export default UserPermissions;



