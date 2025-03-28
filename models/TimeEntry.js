import mongoose from "mongoose";
import schema from "../database/schemas/TimeEntrySchema.js";

const TimeEntry = mongoose.model('TimeEntrySchema',schema);

export default TimeEntry;


