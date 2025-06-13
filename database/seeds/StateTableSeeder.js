import mongoose from "mongoose";
import connectDB from "../../config/database.js";
import State from "../../models/State.js";
import Country from "../../models/Country.js";

export const stateTable = async () => {
  try {
    await connectDB();

    const country = await Country.findOne({ name: "India" });

    const states = [
      { name: "Gujarat", countryId: country._id }, 
    ];

    await State.insertMany(states);
    mongoose.connection.close();
  } catch (error) {
    console.error("Error during seeding:", error.message);
    mongoose.connection.close();
  }
};
