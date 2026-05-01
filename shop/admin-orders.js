(function () {
  const API_BASE = "https://bite-of-bliss-production.up.railway.app/api";
  const STATUS_OPTIONS = ["pending", "confirmed", "preparing", "delivered", "cancelled"];

  const tableBody = document.getElementById("ordersTableBody");
  const accessMessage = document.getElementById("adminAccessMessage");
  const refreshOrdersBtn = document.getElementById("refreshOrdersBtn");

  function token() {
    return localStorage.getItem("token") || "";
  }

  function isAdmin() {
    return localStorage.getItem("userRole") === "admin";
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
          return '<option value="' + status + '" ' + selected + '>' + status + "</option>";
        }).join("");

        return (
          "<tr>" +
          "<td>" + order._id + "</td>" +
          "<td>" + (order.user?.name || "Unknown") + "<br>" + (order.user?.email || "") + "</td>" +
          "<td>" + itemText + "</td>" +
          "<td>" + currency(order.totalAmount) + "</td>" +
          '<td><select data-order-id="' + order._id + '">' + options + "</select></td>" +
          '<td><button class="save-status-btn" data-order-id="' + order._id + '">Save</button></td>' +
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
        headers: { Authorization: "Bearer " + token() },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load orders");
      }

      renderRows(data);
    } catch (error) {
      setMessage(error.message, "error");
      tableBody.innerHTML = '<tr><td colspan="6">Could not load orders.</td></tr>';
    }
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

  refreshOrdersBtn.addEventListener("click", fetchOrders);
  fetchOrders();
})();
