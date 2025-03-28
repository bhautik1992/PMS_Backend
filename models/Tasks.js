import mongoose from "mongoose";
import schema from "../database/schemas/TasksSchema.js";

const Tasks = mongoose.model('Tasks',schema);

export default Tasks;


