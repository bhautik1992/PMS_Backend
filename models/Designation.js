import mongoose from 'mongoose';
import schema from '../database/schemas/DesignationSchema.js';

const Designation = mongoose.model('Designation',schema);

export default Designation;


