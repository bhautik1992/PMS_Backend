import mongoose from 'mongoose';
import schema from '../database/schemas/RefreshTokenSchema.js';

const RefreshToken = mongoose.model('RefreshToken', schema);

export default RefreshToken;
