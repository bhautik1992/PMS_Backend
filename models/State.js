import mongoose from "mongoose";
import schema from "../database/schemas/StateSchema.js";

const State = mongoose.model("State", schema);

export default State;
