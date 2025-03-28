import mongoose from 'mongoose';
import schema from '../database/schemas/BankDetailsSchema.js';

const BankDetails = mongoose.model('BankDetails',schema);

export default BankDetails;


