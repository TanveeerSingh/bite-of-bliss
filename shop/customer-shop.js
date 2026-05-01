(function () {
  const API_BASE = "https://bite-of-bliss-production.up.railway.app/api";
  const CART_KEY = "bobCartV1";

  const shopGrid = document.getElementById("shopGrid");
  const cartList = document.getElementById("cartList");
  const cartTotal = document.getElementById("cartTotal");
  const shippingAddressInput = document.getElementById("shippingAddress");
  const placeOrderBtn = document.getElementById("placeOrderBtn");
  const orderMessage = document.getElementById("orderMessage");
  const myOrdersList = document.getElementById("myOrdersList");
  const loginPrompt = document.getElementById("shopLoginPrompt");
  const shopContent = document.getElementById("shopContent");

  let productMap = new Map();
  let cart = [];

  function isLoggedIn() {
    return Boolean(localStorage.getItem("token") || localStorage.getItem("isLoggedIn") === "true");
  }

  function getToken() {
    return localStorage.getItem("token") || "";
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function stockStatus(stock) {
    if (stock <= 0) {
      return "out";
    }

    if (stock <= 5) {
      return "low";
    }

    return "in";
  }

  function stockLabel(stock) {
    if (stock <= 0) {
      return "Out of stock";
    }

    if (stock <= 5) {
      return "Low stock";
    }

    return "In stock";
  }

  function isMongoObjectId(value) {
    return typeof value === "string" && /^[a-f\d]{24}$/i.test(value);
  }

  function findProductIdByName(name) {
    if (!name || !productMap.size) {
      return "";
    }

    const normalized = String(name).trim().toLowerCase();
    for (const product of productMap.values()) {
      if (String(product.name || "").trim().toLowerCase() === normalized) {
        return product._id;
      }
    }

    return "";
  }

  function resolveCartItemProductId(item) {
    if (isMongoObjectId(item.productId)) {
      return item.productId;
    }

    const byName = findProductIdByName(item.name);
    if (byName) {
      return byName;
    }

    return findProductIdByName(item.productId);
  }

  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      cart = Array.isArray(saved) ? saved : [];
    } catch (error) {
      cart = [];
    }
  }

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function setOrderMessage(text, type) {
    if (!orderMessage) {
      return;
    }
    orderMessage.textContent = text;
    orderMessage.className = type ? "shop-message " + type : "shop-message";
  }

  const productQuantities = new Map();

  function renderShop(products) {
    if (!shopGrid) {
      return;
    }

    if (!products.length) {
      shopGrid.innerHTML = "<p class=\"shop-empty\">No backend products found. Add products as admin first.</p>";
      return;
    }

    // Reset each product card quantity when the shop view is rendered.
    products.forEach((product) => {
      if (!productQuantities.has(product._id)) {
        productQuantities.set(product._id, 0);
      }
    });

    shopGrid.innerHTML = products
      .map(
        (product) => {
          const stock = Number(product.stock) || 0;
          const status = stockStatus(stock);
          const disabled = stock <= 0 ? "disabled" : "";

          return (
          '<article class="shop-product-card ' + (status !== "in" ? status + "-stock" : "") + '">' +
          '<h4>' + product.name + '</h4>' +
          '<p>' + (product.description || "Freshly baked and handcrafted.") + '</p>' +
          '<div class="shop-stock-row">' +
          '<span class="stock-pill ' + (status === "in" ? "in-stock" : status === "low" ? "low-stock" : "out-of-stock") + '">' + stockLabel(stock) + '</span>' +
          '<span class="shop-stock-count">' + stock + ' left</span>' +
          '</div>' +
          '<div class="shop-product-footer">' +
          '<span class="shop-product-price">' + formatCurrency(product.price) + '</span>' +
          '<div class="shop-quantity-section">' +
          '<div class="shop-qty-controls">' +
          '<button class="qty-btn-product" data-action="minus" data-product-id="' + product._id + '" ' + disabled + '>−</button>' +
          '<span class="qty-display" data-product-id="' + product._id + '">0</span>' +
          '<button class="qty-btn-product" data-action="plus" data-product-id="' + product._id + '" ' + disabled + '>+</button>' +
          '</div>' +
          '<button class="shop-add-btn" data-product-id="' + product._id + '" ' + disabled + '>' + (stock <= 0 ? "Out of Stock" : "Add") + '</button>' +
          '</div>' +
          '</div>' +
          '</article>'
          );
        }
      )
      .join("");

    shopGrid.querySelectorAll(".qty-btn-product").forEach((button) => {
      button.addEventListener("click", () => {
        const productId = button.getAttribute("data-product-id");
        const action = button.getAttribute("data-action");
          const product = productMap.get(productId);
          const stock = Number(product?.stock) || 0;

          if (stock <= 0) {
            setOrderMessage("This item is out of stock.", "error");
            return;
          }

        const currentQty = productQuantities.get(productId) || 0;
          const newQty = action === "plus" ? Math.min(stock, currentQty + 1) : Math.max(0, currentQty - 1);
        productQuantities.set(productId, newQty);

        const display = shopGrid.querySelector('.qty-display[data-product-id="' + productId + '"]');
        if (display) {
          display.textContent = newQty;
        }
      });
    });

    shopGrid.querySelectorAll(".shop-add-btn").forEach((button) => {
      button.addEventListener("click", () => {
        if (!isLoggedIn()) {
          setOrderMessage("Please sign in first to add items.", "error");
          return;
        }

        const productId = button.getAttribute("data-product-id");
          const product = productMap.get(productId);
          const stock = Number(product?.stock) || 0;
        const quantity = productQuantities.get(productId) || 0;
        
        if (quantity === 0) {
          setOrderMessage("Please select a quantity first.", "error");
          return;
        }

          if (stock <= 0) {
            setOrderMessage("This item is out of stock.", "error");
            return;
          }

          if (quantity > stock) {
            setOrderMessage("Only " + stock + " left in stock for this item.", "error");
            return;
          }

        addToCartWithQuantity(productId, quantity);
        productQuantities.set(productId, 0); // Reset to 0 after adding
        
        const display = shopGrid.querySelector('.qty-display[data-product-id="' + productId + '"]');
        if (display) {
          display.textContent = 0;
        }
      });
    });
  }

  function addToCartWithQuantity(productId, quantity) {
    const product = productMap.get(productId);
    if (!product) {
      return;
    }

    const existing = cart.find((item) => item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ productId: product._id, name: product.name, price: product.price, quantity: quantity });
    }

    saveCart();
    renderCart();
    setOrderMessage(quantity + " item(s) added to cart.", "success");
  }

  function addToCart(productId) {
    const product = productMap.get(productId);
    if (!product) {
      return;
    }

    const existing = cart.find((item) => item.productId === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ productId: product._id, name: product.name, price: product.price, quantity: 1 });
    }

    saveCart();
    renderCart();
    setOrderMessage("Item added to cart.", "success");
  }

  function updateQuantity(productId, delta) {
    cart = cart
      .map((item) => {
        if (item.productId === productId) {
          return { ...item, quantity: item.quantity + delta };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    saveCart();
    renderCart();
  }

  function renderCart() {
    if (!cartList || !cartTotal) {
      return;
    }

    if (!cart.length) {
      cartList.innerHTML = "<p class=\"shop-empty\">Your cart is empty.</p>";
      cartTotal.textContent = formatCurrency(0);
      return;
    }

    cartList.innerHTML = cart
      .map(
        (item) =>
          '<div class="shop-cart-row">' +
          '<div class="shop-cart-item">' +
          '<strong>' + item.name + '</strong>' +
          '<span>' + formatCurrency(item.price) + '</span>' +
          '</div>' +
          '<div class="shop-cart-controls">' +
          '<button class="qty-btn" data-action="minus" data-product-id="' + item.productId + '">-</button>' +
          '<span>' + item.quantity + '</span>' +
          '<button class="qty-btn" data-action="plus" data-product-id="' + item.productId + '">+</button>' +
          '</div>' +
          '</div>'
      )
      .join("");

    cartTotal.textContent = formatCurrency(cart.reduce((sum, item) => sum + item.price * item.quantity, 0));

    cartList.querySelectorAll(".qty-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const productId = button.getAttribute("data-product-id");
        const action = button.getAttribute("data-action");
        updateQuantity(productId, action === "plus" ? 1 : -1);
      });
    });
  }

  function renderMyOrders(orders) {
    if (!myOrdersList) {
      return;
    }

    if (!orders.length) {
      myOrdersList.innerHTML = '<p class="shop-empty">No orders yet.</p>';
      return;
    }

    myOrdersList.innerHTML = orders
      .map((order) => {
        const itemCount = Array.isArray(order.items)
          ? order.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
          : 0;

        return (
          '<div class="my-order-row">' +
          '<div class="my-order-head">' +
          '<span class="my-order-id">Order #' + String(order._id || "").slice(-6).toUpperCase() + '</span>' +
          '<span class="my-order-status ' + (order.status || "pending") + '">' + (order.status || "pending") + '</span>' +
          '</div>' +
          '<div class="my-order-meta">' +
          itemCount + ' item(s) • ' + formatCurrency(Number(order.totalAmount) || 0) +
          '</div>' +
          '</div>'
        );
      })
      .join("");
  }

  async function loadMyOrders() {
    if (!myOrdersList) {
      return;
    }

    if (!isLoggedIn()) {
      myOrdersList.innerHTML = '<p class="shop-empty">Sign in to view order status.</p>';
      return;
    }

    try {
      const response = await fetch(API_BASE + "/orders/my-orders", {
        cache: "no-store",
        headers: {
          Authorization: "Bearer " + getToken(),
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load your orders");
      }

      renderMyOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      myOrdersList.innerHTML = '<p class="shop-empty">Unable to load order status.</p>';
    }
  }

  async function loadProducts() {
    try {
      // Bootstrap once, then read the live catalog.
      await fetch(API_BASE + "/products/bootstrap", {
        method: "POST",
      });

      const response = await fetch(API_BASE + "/products", {
        cache: "no-store",
      });
      let products = await response.json();

      if (!response.ok) {
        throw new Error(products.error || "Failed to load products");
      }

      productMap = new Map(products.map((product) => [product._id, product]));
      renderShop(products);
    } catch (error) {
      if (shopGrid) {
        shopGrid.innerHTML = '<p class="shop-empty">' + error.message + "</p>";
      }
    }
  }

  async function placeOrder() {
    if (!isLoggedIn()) {
      setOrderMessage("Please sign in first.", "error");
      return;
    }

    if (!cart.length) {
      setOrderMessage("Your cart is empty.", "error");
      return;
    }

    const shippingAddress = shippingAddressInput ? shippingAddressInput.value.trim() : "";
    if (!shippingAddress) {
      setOrderMessage("Please enter shipping address.", "error");
      return;
    }

    try {
      placeOrderBtn.disabled = true;
      setOrderMessage("Placing order...", "");

      // Resolve saved cart items against real product IDs before checkout.
      if (!productMap.size) {
        await loadProducts();
      }

      const unresolved = [];
      const resolvedItems = [];
      let cartWasUpdated = false;

      cart.forEach((item) => {
        const resolvedProductId = resolveCartItemProductId(item);
        if (!resolvedProductId) {
          unresolved.push(item.name || item.productId || "Unknown item");
          return;
        }

        const quantity = Math.max(1, Number(item.quantity) || 1);
        resolvedItems.push({ productId: resolvedProductId, quantity });

        if (item.productId !== resolvedProductId || item.quantity !== quantity) {
          item.productId = resolvedProductId;
          item.quantity = quantity;
          cartWasUpdated = true;
        }
      });

      if (cartWasUpdated) {
        saveCart();
        renderCart();
      }

      if (!resolvedItems.length) {
        throw new Error("No valid products found in cart. Please re-add items from the menu.");
      }

      if (unresolved.length) {
        throw new Error("Some items are unavailable: " + unresolved.join(", ") + ". Please remove and re-add them.");
      }

      const payload = {
        items: resolvedItems,
        shippingAddress,
      };

      const response = await fetch(API_BASE + "/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getToken(),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Order failed");
      }

      cart = [];
      saveCart();
      renderCart();
      if (shippingAddressInput) {
        shippingAddressInput.value = "";
      }

      setOrderMessage("Order placed successfully. Order ID: " + data._id, "success");
      loadMyOrders();
    } catch (error) {
      setOrderMessage(error.message, "error");
    } finally {
      placeOrderBtn.disabled = false;
    }
  }

  function syncAuthUI() {
    const signedIn = isLoggedIn();
    if (loginPrompt) {
      loginPrompt.style.display = signedIn ? "none" : "block";
    }
    if (shopContent) {
      shopContent.style.display = signedIn ? "grid" : "none";
    }
    if (signedIn && shopContent && shopContent.style.display !== "none") {
      loadCart();
      renderCart();
      loadMyOrders();
    } else if (myOrdersList) {
      myOrdersList.innerHTML = '<p class="shop-empty">Sign in to view order status.</p>';
    }
  }

  function init() {
    // Refresh the shop state whenever the page loads.
    loadCart();
    renderCart();
    syncAuthUI();
    loadProducts();
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener("click", placeOrder);
    }

    window.addEventListener("storage", () => {
      syncAuthUI();
      loadCart();
      renderCart();
      loadMyOrders();
    });

    window.addEventListener("bob-cart-updated", () => {
      loadCart();
      renderCart();
    });

    loadMyOrders();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
