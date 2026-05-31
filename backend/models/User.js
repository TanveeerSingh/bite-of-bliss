const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  // index
  email: { type: String, unique: true, index: true },
  password: String,
  // index
  role: { type: String, default: "customer", index: true }
}, { versionKey: false });

module.exports = mongoose.model("User", userSchema);