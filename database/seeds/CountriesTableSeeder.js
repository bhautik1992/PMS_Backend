import mongoose from "mongoose";
import Country from "../../models/Country.js";
import connectDB from "../../config/database.js";

const countries = [
  { name: "Afghanistan", code: "AF", currency: "AFN", symbol: "؋" },
  { name: "Albania", code: "AL", currency: "ALL", symbol: "L" },
  { name: "Algeria", code: "DZ", currency: "DZD", symbol: "د.ج" },
  { name: "Andorra", code: "AD", currency: "EUR", symbol: "€" },
  { name: "Angola", code: "AO", currency: "AOA", symbol: "Kz" },
];

export const countryTable = async () => {
  try {
    await connectDB();
    await Country.insertMany(countries);
    mongoose.connection.close();
  } catch (error) {
    // console.error('Error during seeding:', error);
    mongoose.connection.close();
  }
};

