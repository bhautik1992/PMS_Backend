import mongoose from "mongoose";
import schema from "../database/schemas/HolidaySchema.js";

const Holiday = mongoose.model("Holiday", schema);

export default Holiday;
