const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const courses = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    __v: { type: Number, select: false },
  },
  {
    // toJSON: {
    //   transform: (_doc, ret) => {
    //     delete ret._id;
    //     delete ret.id;
    //     delete ret.__v;
    //     return ret;
    //   },
    // },
  },
);

module.exports = mongoose.model("Course", courses);
