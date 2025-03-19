import mongoose from "mongoose";
import schema from "./schemas/TasksSchema.js";

const Tasks = mongoose.model('Tasks',schema);

export default Tasks;


