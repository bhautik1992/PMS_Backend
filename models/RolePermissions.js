import mongoose from 'mongoose';
import schema from './schemas/RolePermissionsSchema.js';

const RolePermissions = mongoose.model('RolePermissions',schema);

export default RolePermissions;


