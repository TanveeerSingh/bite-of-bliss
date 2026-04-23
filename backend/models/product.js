const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, default: "general", trim: true },
  description: { type: String, default: "", trim: true },
  stock: { type: Number, default: 0, min: 0 },
  image: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);