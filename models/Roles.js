import mongoose from 'mongoose';
import schema from '../database/schemas/RolesSchema.js';

const Roles = mongoose.model('Roles',schema);

export default Roles;


