import mongoose from 'mongoose';
import schema from './schemas/SettingsSchema.js';

const Settings = mongoose.model('Settings',schema);

export default Settings;


