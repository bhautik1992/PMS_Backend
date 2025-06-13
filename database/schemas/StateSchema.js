import mongoose from "mongoose";
import MongooseDelete from "mongoose-delete";

const schema = new mongoose.Schema({
  name: { type: String,
         required: true,
    },
  countryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
  deletedAt: {
    type: Date,
    default: null,
  },
},
{
  timestamps: true,
}
);

schema.plugin(MongooseDelete, {
  deletedAt: true, // Adds deletedAt field
  overrideMethods: "all", // Ensures soft-deleted records are hidden from normal queries
  deletedBy: false, // Optionally store the user who deleted the record
});


export default schema;
