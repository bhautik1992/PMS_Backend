import mongoose from 'mongoose';
import schema from './schemas/DesignationSchema.js';

const Designation = mongoose.model('Designation',schema);

export default Designation;


