import mongoose from 'mongoose';
import schema from '../database/schemas/BanksSchema.js';

const Banks = mongoose.model('Banks',schema);

export default Banks;


