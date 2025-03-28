import mongoose from 'mongoose';
import schema from '../database/schemas/PermissionsSchema.js';

const Permissions = mongoose.model('Permissions',schema);

export default Permissions;


