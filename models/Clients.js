import mongoose from 'mongoose';
import schema from './schemas/ClientsSchema.js';

const Clients = mongoose.model('Clients',schema);

export default Clients;


