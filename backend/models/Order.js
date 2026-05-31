const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // index
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (items) {
          return items.length > 0;
        },
        message: "Order must contain at least one item"
      }
    },
    totalAmount: { type: Number, required: true, min: 0 },
    // index
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "delivered", "cancelled"],
      default: "pending",
      index: true
    },
    shippingAddress: {
      type: String,
      required: true,
      trim: true
    }
  },
  { versionKey: false }
);

module.exports = mongoose.model("Order", orderSchema);
