import mongoose from 'mongoose';
import schema from '../database/schemas/ClientsSchema.js';

const Clients = mongoose.model('Clients',schema);

export default Clients;


