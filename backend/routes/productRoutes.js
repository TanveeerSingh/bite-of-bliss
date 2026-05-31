const express = require("express");
const router = express.Router();
const {
	createProduct,
	getProducts,
	bootstrapProducts,
	getProductById,
	updateProduct,
	deleteProduct,
	// aggregation
	getProductStatsByCategory,
	getLowStockProducts,
	getPriceRangeAnalysis
} = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// aggregation
router.get("/analytics/stats-by-category", protect, adminOnly, getProductStatsByCategory);
router.get("/analytics/low-stock", protect, adminOnly, getLowStockProducts);
router.get("/analytics/price-range", protect, adminOnly, getPriceRangeAnalysis);

// CRUD
router.post("/", protect, adminOnly, createProduct);
router.post("/bootstrap", bootstrapProducts);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;