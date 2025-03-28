import mongoose from 'mongoose';
import schema from '../database/schemas/RolePermissionsSchema.js';

const RolePermissions = mongoose.model('RolePermissions',schema);

export default RolePermissions;


