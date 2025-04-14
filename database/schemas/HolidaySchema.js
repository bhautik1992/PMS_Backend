import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 50,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

schema.plugin(mongooseDelete, {
  deletedAt: true, // Adds deletedAt field
  overrideMethods: "all", // Ensures soft-deleted records are hidden from normal queries
  deletedBy: false, // Optionally store the user who deleted the record
});

export default schema;
