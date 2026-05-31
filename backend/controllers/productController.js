const Product = require("../models/product");

exports.createProduct = async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: "Name and price are required" });
    }

    // Admins can send the full product payload here.
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ _id: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.bootstrapProducts = async (req, res) => {
  try {
    // Seed the catalog the first time the database is empty.
    const defaults = [
      { name: "Artisan Sourdough", price: 249, category: "bread", description: "Traditional sourdough bread made with organic flour", stock: 50 },
      { name: "Vegan Blueberry Muffins", price: 199, category: "muffin", description: "Made with fresh blueberries and almond milk", stock: 50 },
      { name: "Classic Chicken Pot Pie", price: 349, category: "savory", description: "Tender chicken and vegetables in flaky crust", stock: 30 },
      { name: "Butter Croissant", price: 159, category: "pastry", description: "Flaky, buttery layers of hand-laminated pastry", stock: 60 },
      { name: "Vegan Chocolate Cake", price: 299, category: "cake", description: "Rich chocolate cake made with plant-based ingredients", stock: 20 },
      { name: "Multigrain Bread", price: 279, category: "bread", description: "Healthy blend of organic grains and seeds", stock: 40 },
      { name: "Turkey Avocado Sandwich", price: 329, category: "sandwich", description: "Organic turkey with fresh avocado on sourdough", stock: 35 },
      { name: "Vegan Berry Danish", price: 189, category: "pastry", description: "Flaky pastry filled with mixed berries", stock: 35 },
      { name: "Classic Apple Pie", price: 399, category: "pie", description: "Fresh apples, cinnamon, buttery crust", stock: 25 },
      { name: "Hot Chocolate Bombs", price: 229, category: "winter", description: "Chocolate spheres with cocoa mix and marshmallows", stock: 40 },
      { name: "Gingerbread Cookies", price: 179, category: "cookie", description: "Classic cookies with a spicy-sweet ginger flavor", stock: 40 },
      { name: "Peppermint Bark", price: 259, category: "winter", description: "Layers of dark and white chocolate with crushed candy canes", stock: 35 },
      { name: "Cinnamon Rolls", price: 209, category: "winter", description: "Warm rolls topped with cream cheese frosting", stock: 40 },
      { name: "Yule Log Cake", price: 499, category: "cake", description: "Holiday sponge cake roll with cream filling", stock: 20 },
      { name: "Eggnog Cheesecake Bars", price: 239, category: "winter", description: "Rich cheesecake bars infused with eggnog flavor", stock: 30 },
      { name: "Apple Cider Donuts", price: 169, category: "winter", description: "Soft donuts coated with cinnamon sugar", stock: 45 },
      { name: "Spiced Cranberry Muffins", price: 189, category: "muffin", description: "Muffins with tart cranberries and winter spices", stock: 40 },
      { name: "Seasonal Shortbread Cookies", price: 199, category: "cookie", description: "Seasonal shortbread with festive flavors", stock: 40 }
    ];

    let insertedCount = 0;
    for (const product of defaults) {
      const existing = await Product.findOne({ name: product.name });
      if (!existing) {
        await Product.create(product);
        insertedCount += 1;
      }
    }

    res.status(201).json({ message: "Default products synchronized", insertedCount, totalDefaults: defaults.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    // Updates go straight into MongoDB so inventory stays simple.
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// aggregation
exports.getProductStatsByCategory = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          totalProducts: { $sum: 1 },
          avgPrice: { $avg: "$price" },
          totalStock: { $sum: "$stock" }
        }
      },
      { $sort: { totalProducts: -1 } }
    ]);

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// aggregation
exports.getLowStockProducts = async (req, res) => {
  try {
    const threshold = req.query.threshold || 20; // Default: show products with stock < 20

    const lowStockProducts = await Product.aggregate([
      { $match: { stock: { $lt: parseInt(threshold) } } },
      { $sort: { stock: 1 } }
    ]);

    res.json(lowStockProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// aggregation
exports.getPriceRangeAnalysis = async (req, res) => {
  try {
    const analysis = await Product.aggregate([
      {
        $project: {
          name: 1,
          price: 1,
          stock: 1,
          category: 1,
          priceRange: {
            $cond: [
              { $lt: ["$price", 200] },
              "Budget",
              { $cond: [{ $lt: ["$price", 350] }, "Mid-Range", "Premium"] }
            ]
          }
        }
      },
      {
        $group: {
          _id: "$priceRange",
          count: { $sum: 1 },
          avgPrice: { $avg: "$price" },
          avgStock: { $avg: "$stock" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};