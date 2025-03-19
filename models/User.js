import mongoose from 'mongoose';
import schema from './schemas/UsersSchema.js';

const User = mongoose.model('User',schema);

export default User;


