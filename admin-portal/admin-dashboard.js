(function () {
  const API_BASE = "http://localhost:5001/api";
  const STATUS_OPTIONS = ["pending", "confirmed", "preparing", "delivered", "cancelled"];

  const tableBody = document.getElementById("ordersTableBody");
  const inventoryTableBody = document.getElementById("inventoryTableBody");
  const accessMessage = document.getElementById("adminAccessMessage");
  const refreshOrdersBtn = document.getElementById("refreshOrdersBtn");
  const exportOrdersBtn = document.getElementById("exportOrdersBtn");
  const logoutAdminBtn = document.getElementById("logoutAdminBtn");
  const orderSearchInput = document.getElementById("orderSearchInput");
  const orderStatusFilter = document.getElementById("orderStatusFilter");
  const orderCountLabel = document.getElementById("orderCountLabel");
  const inventorySearchInput = document.getElementById("inventorySearchInput");
  const inventoryStockFilter = document.getElementById("inventoryStockFilter");
  const inventoryCountLabel = document.getElementById("inventoryCountLabel");
  const statTotalOrders = document.getElementById("statTotalOrders");
  const statPendingOrders = document.getElementById("statPendingOrders");
  const statDeliveredOrders = document.getElementById("statDeliveredOrders");
  const statRevenue = document.getElementById("statRevenue");
  const LOW_STOCK_THRESHOLD = 5;
  let allOrders = [];
  let allProducts = [];

  function token() {
    return localStorage.getItem("adminToken") || "";
  }

  function isAdmin() {
    return localStorage.getItem("adminRole") === "admin";
  }

  function currency(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function setMessage(text, type) {
    accessMessage.textContent = text;
    accessMessage.className = type ? "admin-msg " + type : "admin-msg";
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
  }

  function updateOrderCount(total, visible) {
    if (!orderCountLabel) {
      return;
    }

    orderCountLabel.textContent = "Showing " + visible + " of " + total + " orders";
  }

  function updateInventoryCount(total, visible) {
    if (!inventoryCountLabel) {
      return;
    }

    inventoryCountLabel.textContent = "Showing " + visible + " of " + total + " products";
  }

  function updateOrderStats(orders) {
    if (!statTotalOrders || !statPendingOrders || !statDeliveredOrders || !statRevenue) {
      return;
    }

    const pendingCount = orders.filter((order) => order.status === "pending").length;
    const deliveredCount = orders.filter((order) => order.status === "delivered").length;
    const revenue = orders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);

    statTotalOrders.textContent = String(orders.length);
    statPendingOrders.textContent = String(pendingCount);
    statDeliveredOrders.textContent = String(deliveredCount);
    statRevenue.textContent = currency(revenue);
  }

  function getFilteredOrders() {
    const searchTerm = normalizeText(orderSearchInput ? orderSearchInput.value : "");
    const selectedStatus = normalizeText(orderStatusFilter ? orderStatusFilter.value : "");

    return allOrders.filter((order) => {
      const statusMatches = !selectedStatus || order.status === selectedStatus;
      const searchableText = normalizeText(
        order._id + " " + (order.user?.name || "") + " " + (order.user?.email || "")
      );
      const textMatches = !searchTerm || searchableText.includes(searchTerm);

      return statusMatches && textMatches;
    });
  }

  function getFilteredProducts() {
    const searchTerm = normalizeText(inventorySearchInput ? inventorySearchInput.value : "");
    const stockFilter = normalizeText(inventoryStockFilter ? inventoryStockFilter.value : "");

    return allProducts.filter((product) => {
      const stock = Number(product.stock) || 0;
      const status = stockStatusClass(stock);
      const searchableText = normalizeText((product.name || "") + " " + (product.category || ""));

      const stockMatches = !stockFilter || status === stockFilter;
      const textMatches = !searchTerm || searchableText.includes(searchTerm);

      return stockMatches && textMatches;
    });
  }

  function applyOrderFilters() {
    const filteredOrders = getFilteredOrders();
    renderRows(filteredOrders);
    updateOrderCount(allOrders.length, filteredOrders.length);
    updateOrderStats(allOrders);
  }

  function applyInventoryFilters() {
    const filteredProducts = getFilteredProducts();
    renderInventory(filteredProducts);
    updateInventoryCount(allProducts.length, filteredProducts.length);
  }

  function renderRows(orders) {
    if (!orders.length) {
      tableBody.innerHTML = '<tr><td colspan="6">No orders found.</td></tr>';
      return;
    }

    tableBody.innerHTML = orders
      .map((order) => {
        const itemText = order.items.map((item) => item.name + " x" + item.quantity).join(", ");
        const options = STATUS_OPTIONS.map((status) => {
          const selected = status === order.status ? "selected" : "";
          return '<option value="' + status + '" ' + selected + '>' + status + '</option>';
        }).join("");

        return (
          "<tr>" +
          "<td>" + order._id + "</td>" +
          "<td>" + (order.user?.name || "Unknown") + "<br>" + (order.user?.email || "") + "</td>" +
          "<td>" + itemText + "</td>" +
          "<td>" + currency(order.totalAmount) + "</td>" +
          '<td><select data-order-id="' + order._id + '">' + options + "</select></td>" +
          '<td><button class="save-status-btn" data-order-id="' + order._id + '">Save</button>' +
          '<button class="delete-order-btn" data-order-id="' + order._id + '">Delete</button></td>' +
          "</tr>"
        );
      })
      .join("");

    tableBody.querySelectorAll(".save-status-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const orderId = button.getAttribute("data-order-id");
        const select = tableBody.querySelector('select[data-order-id="' + orderId + '"]');
        updateStatus(orderId, select.value);
      });
    });

    tableBody.querySelectorAll(".delete-order-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const orderId = button.getAttribute("data-order-id");
        deleteOrder(orderId);
      });
    });
  }

  function stockStatusClass(stock) {
    if (stock <= 0) {
      return "out-of-stock";
    }

    if (stock <= LOW_STOCK_THRESHOLD) {
      return "low-stock";
    }

    return "in-stock";
  }

  function stockStatusLabel(stock) {
    if (stock <= 0) {
      return "Out of stock";
    }

    if (stock <= LOW_STOCK_THRESHOLD) {
      return "Low stock";
    }

    return "In stock";
  }

  function renderInventory(products) {
    if (!inventoryTableBody) {
      return;
    }

    if (!products.length) {
      inventoryTableBody.innerHTML = '<tr><td colspan="6">No products found.</td></tr>';
      return;
    }

    inventoryTableBody.innerHTML = products
      .map((product) => {
        const stock = Number(product.stock) || 0;
        const statusClass = stockStatusClass(stock);
        const price = Number(product.price) || 0;
        const category = product.category || "general";

        return (
          '<tr class="inventory-row ' + statusClass + '">' +
          '<td><strong>' + product.name + '</strong></td>' +
          '<td><span class="category-label">' + category + '</span></td>' +
          '<td><input class="price-input" type="number" min="0" step="1" value="' + price + '" data-field="price" data-product-id="' + product._id + '" /></td>' +
          '<td><span class="stock-pill ' + statusClass + '">' + stockStatusLabel(stock) + '</span></td>' +
          '<td><input class="stock-input" type="number" min="0" value="' + stock + '" data-field="stock" data-product-id="' + product._id + '" /></td>' +
          '<td><button class="stock-save-btn" data-product-id="' + product._id + '">Save Changes</button></td>' +
          '</tr>'
        );
      })
      .join("");

    inventoryTableBody.querySelectorAll(".stock-save-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const productId = button.getAttribute("data-product-id");
        const priceInput = inventoryTableBody.querySelector('input[data-field="price"][data-product-id="' + productId + '"]');
        const stockInput = inventoryTableBody.querySelector('input[data-field="stock"][data-product-id="' + productId + '"]');

        updateProduct(productId, {
          price: priceInput ? priceInput.value : "0",
          stock: stockInput ? stockInput.value : "0",
        });
      });
    });
  }

  async function fetchInventory() {
    if (!inventoryTableBody) {
      return;
    }

    try {
      const response = await fetch(API_BASE + "/products", {
        cache: "no-store",
        headers: { Authorization: "Bearer " + token() },
      });

      const products = await response.json();
      if (!response.ok) {
        throw new Error(products.error || "Failed to load inventory");
      }

      allProducts = Array.isArray(products) ? products : [];
      applyInventoryFilters();
    } catch (error) {
      inventoryTableBody.innerHTML = '<tr><td colspan="6">Could not load inventory.</td></tr>';
    }
  }

  async function updateProduct(productId, payload) {
    const price = Math.max(0, Number(payload.price) || 0);
    const stock = Math.max(0, Number(payload.stock) || 0);

    try {
      const response = await fetch(API_BASE + "/products/" + productId, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token(),
        },
        body: JSON.stringify({ price: price, stock: stock }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update stock");
      }

      setMessage("Product updated.", "success");
      fetchInventory();
    } catch (error) {
      setMessage(error.message, "error");
    }
  }

  async function fetchOrders() {
    if (!token()) {
      setMessage("Please sign in as admin first.", "error");
      tableBody.innerHTML = '<tr><td colspan="6">Not authorized.</td></tr>';
      return;
    }

    if (!isAdmin()) {
      setMessage("Current signed-in account is not admin.", "error");
      tableBody.innerHTML = '<tr><td colspan="6">Admin access required.</td></tr>';
      return;
    }

    setMessage("", "");

    try {
      const response = await fetch(API_BASE + "/orders", {
        cache: "no-store",
        headers: { Authorization: "Bearer " + token() },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load orders");
      }

      allOrders = Array.isArray(data) ? data : [];
      applyOrderFilters();
    } catch (error) {
      setMessage(error.message, "error");
      tableBody.innerHTML = '<tr><td colspan="6">Could not load orders.</td></tr>';
    }
  }

  function toCsvValue(value) {
    const escaped = String(value ?? "").replace(/"/g, '""');
    return '"' + escaped + '"';
  }

  function exportOrdersAsCsv() {
    const rows = getFilteredOrders();
    if (!rows.length) {
      setMessage("No orders available to export.", "error");
      return;
    }

    const csvHeaders = ["Order ID", "Customer Name", "Customer Email", "Items", "Total", "Status"];
    const csvRows = rows.map((order) => {
      const items = order.items.map((item) => item.name + " x" + item.quantity).join(" | ");
      return [
        order._id,
        order.user?.name || "Unknown",
        order.user?.email || "",
        items,
        Number(order.totalAmount) || 0,
        order.status,
      ]
        .map(toCsvValue)
        .join(",");
    });

    const csvContent = [csvHeaders.map(toCsvValue).join(",")].concat(csvRows).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateTag = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = "admin-orders-" + dateTag + ".csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setMessage("Orders exported successfully.", "success");
  }

  async function updateStatus(orderId, status) {
    try {
      const response = await fetch(API_BASE + "/orders/" + orderId + "/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token(),
        },
        body: JSON.stringify({ status: status }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      setMessage("Order status updated.", "success");
      fetchOrders();
    } catch (error) {
      setMessage(error.message, "error");
    }
  }

  async function deleteOrder(orderId) {
    if (!confirm("Delete this order?")) {
      return;
    }

    try {
      const response = await fetch(API_BASE + "/orders/" + orderId, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token() },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete order");
      }

      setMessage("Order deleted successfully.", "success");
      fetchOrders();
    } catch (error) {
      setMessage(error.message, "error");
    }
  }

  async function refreshDashboard() {
    await Promise.all([fetchOrders(), fetchInventory()]);
  }

  refreshOrdersBtn.addEventListener("click", refreshDashboard);
  if (exportOrdersBtn) {
    exportOrdersBtn.addEventListener("click", exportOrdersAsCsv);
  }

  if (orderSearchInput) {
    orderSearchInput.addEventListener("input", applyOrderFilters);
  }

  if (orderStatusFilter) {
    orderStatusFilter.addEventListener("change", applyOrderFilters);
  }

  if (inventorySearchInput) {
    inventorySearchInput.addEventListener("input", applyInventoryFilters);
  }

  if (inventoryStockFilter) {
    inventoryStockFilter.addEventListener("change", applyInventoryFilters);
  }

  logoutAdminBtn.addEventListener("click", () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUserName");
    localStorage.removeItem("adminUserId");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminIsLoggedIn");
    window.location.href = "admin-login.html";
  });

  fetchOrders();
  fetchInventory();
})();
