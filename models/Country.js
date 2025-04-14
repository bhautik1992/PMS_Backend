import mongoose from "mongoose";
import schema from "../database/schemas/CountryTableSchema.js";

const Country = mongoose.model("Country", schema);

export default Country;
