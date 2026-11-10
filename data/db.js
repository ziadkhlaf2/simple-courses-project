const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }
  console.log(`Connecting...`)
  await mongoose.connect(uri); // اتصال بقاعدة البيانات
  let date = new Date();
  console.log(`Connected to MongoDB at ${date.toISOString()}`);
};

module.exports = connectDB;