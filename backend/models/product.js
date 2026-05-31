const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  // index
  name: { type: String, required: true, trim: true, index: true },
  price: { type: Number, required: true, min: 0 },
  // index
  category: { type: String, default: "general", trim: true, index: true },
  description: { type: String, default: "", trim: true },
  stock: { type: Number, default: 0, min: 0 },
  image: { type: String, default: "" }
}, { versionKey: false });

module.exports = mongoose.model("Product", productSchema);