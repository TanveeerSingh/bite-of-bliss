const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  // aggregation
  getOrderStatsByStatus,
  getRevenueByProduct,
  getCustomerOrderSummary
} = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// aggregation
router.get("/analytics/stats-by-status", protect, adminOnly, getOrderStatsByStatus);
router.get("/analytics/revenue-by-product", protect, adminOnly, getRevenueByProduct);
router.get("/analytics/customer-summary", protect, adminOnly, getCustomerOrderSummary);

// CRUD
router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/", protect, adminOnly, getAllOrders);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);
router.delete("/:id", protect, adminOnly, deleteOrder);

module.exports = router;
