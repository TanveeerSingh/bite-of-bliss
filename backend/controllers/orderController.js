const Order = require("../models/Order");
const Product = require("../models/product");

exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    // Empty carts should never reach checkout.
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order items are required" });
    }

    if (!shippingAddress) {
      return res.status(400).json({ error: "Shipping address is required" });
    }

    const requestedQuantities = new Map();
    for (const item of items) {
      const productId = String(item.productId || "").trim();
      const quantity = Math.max(1, Number(item.quantity) || 1);
      requestedQuantities.set(productId, (requestedQuantities.get(productId) || 0) + quantity);
    }

    // Combine duplicate items and total the order in one pass.
    const orderItems = [];
    let totalAmount = 0;

    for (const [productId, quantity] of requestedQuantities.entries()) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(400).json({ error: `Product not found: ${productId}` });
      }

      if (quantity < 1) {
        return res.status(400).json({ error: "Quantity must be at least 1" });
      }
      //stock reduction logic
      const availableStock = Number(product.stock) || 0;
      if (availableStock < quantity) {
        return res.status(400).json({
          error: `${product.name} is out of stock or does not have enough stock. Available: ${availableStock}`
        });
      }

      const lineAmount = product.price * quantity;
      totalAmount += lineAmount;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity
      });

      product.stock = availableStock - quantity;
      await product.save();
    }

    // Save the order only after stock has been checked and deducted.
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ _id: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ _id: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Keep order status values within the allowed lifecycle.
    const allowedStatuses = ["pending", "confirmed", "preparing", "delivered", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid order status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: 'after', runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// aggregation
exports.getOrderStatsByStatus = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          //avgAmount: { $avg: "$totalAmount" },
          totalAmount: { $sum: "$totalAmount" }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// aggregation
exports.getRevenueByProduct = async (req, res) => {
  try {
    const revenue = await Order.aggregate([
      { $match: { status: { $in: ["delivered", "confirmed"] } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalQuantitySold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    res.json(revenue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// aggregation
exports.getCustomerOrderSummary = async (req, res) => {
  try {
    const customerStats = await Order.aggregate([
      {
        $group: {
          _id: "$user",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
          avgOrderValue: { $avg: "$totalAmount" },
          lastOrderId: { $max: "$_id" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: "$userInfo" },
      { $sort: { totalSpent: -1 } },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: "$userInfo.name",
          email: "$userInfo.email",
          totalOrders: 1,
          totalSpent: 1,
          avgOrderValue: { $round: ["$avgOrderValue", 2] },
          lastOrderId: 1
        }
      }
    ]);

    res.json(customerStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
