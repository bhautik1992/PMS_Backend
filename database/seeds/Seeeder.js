import mongoose from "mongoose";
import Holiday from "../../models/Holiday.js";
import connectDB from "../../config/database.js";

const Holidaysss = [
  {
    name: "New Year",
    start_date: new Date("2025-01-01"),
    end_date: new Date("2025-01-01"),
  },
  {
    name: "Republic Day",
    start_date: new Date("2025-01-26"),
    end_date: new Date("2025-01-26"),
  },
  {
    name: "Holi",
    start_date: new Date("2025-03-17"),
    end_date: new Date("2025-03-18"),
  },
  {
    name: "Good Friday",
    start_date: new Date("2025-04-18"),
    end_date: new Date("2025-04-18"),
  },
  {
    name: "Eid al-Fitr",
    start_date: new Date("2025-03-31"),
    end_date: new Date("2025-04-01"),
  },
  {
    name: "Independence Day",
    start_date: new Date("2025-08-15"),
    end_date: new Date("2025-08-15"),
  },
  {
    name: "Raksha Bandhan",
    start_date: new Date("2025-08-19"),
    end_date: new Date("2025-08-19"),
  },
  {
    name: "Diwali",
    start_date: new Date("2025-10-21"),
    end_date: new Date("2025-10-22"),
  },
  {
    name: "Christmas",
    start_date: new Date("2025-12-25"),
    end_date: new Date("2025-12-25"),
  },
  {
    name: "Boxing Day",
    start_date: new Date("2025-12-26"),
    end_date: new Date("2025-12-26"),
  },
];

export const HolidayTable = async () => {
  try {
    await connectDB();
    await Holiday.insertMany(Holidaysss);
    mongoose.connection.close();
  } catch (error) {
    // console.error('Error during seeding:', error);
    mongoose.connection.close();
  }
};

HolidayTable();
