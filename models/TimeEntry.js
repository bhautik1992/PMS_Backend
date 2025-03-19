import mongoose from "mongoose";
import schema from "./schemas/TimeEntrySchema.js";

const TimeEntry = mongoose.model('TimeEntrySchema',schema);

export default TimeEntry;


