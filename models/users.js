const mongoose = require("mongoose");
const validator = require("validator");
const userRole = require("../utils/userRole");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, validate: [validator.isEmail, "Please enter a valid email"] },
  password: { type: String, required: true },
  token: { type: String},
  role: { type: String, enum: [userRole.USER, userRole.ADMIN, userRole.MANAGER], default: userRole.USER },
  avatar: { type: String, default: "../uploads/photo.webp"},
  __v: { type: Number, select: false },
});


module.exports = mongoose.model("User", userSchema);