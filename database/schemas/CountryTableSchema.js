import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 30,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      maxLength: 2,
      unique: true,
    },
    currency: {
      type: String,
      required: true,
      maxLength: 3,
      unique: true,
    },
    symbol: {
      type: String,
      required: true,
      maxLength: 5,
      unique: true,
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
