// ================================
// Admin Dashboard Script
// ================================

document.addEventListener("DOMContentLoaded", () => {
  loadOrders();
});

// ================================
// Load all orders
// ================================
function loadOrders() {
  fetch("/api/orders")
    .then(res => {
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    })
    .then(data => {
      const table = document.getElementById("ordersTable");
      table.innerHTML = "";

      if (!data || data.length === 0) {
        table.innerHTML = `<tr>
          <td colspan="5" style="text-align:center">No Orders</td>
        </tr>`;
        return;
      }

      data.forEach(order => {
        const itemsHTML = order.items
          .map(i => `${i.name} × ${i.qty}`)
          .join("<br>");

        table.innerHTML += `
          <tr>
            <td>${order.email}</td>
            <td>${itemsHTML}</td>
            <td>₹${order.total}</td>
            <td>${order.status}</td>
            <td>
              <select onchange="updateStatus(${order.id}, this.value)">
                <option ${order.status === "Pending" ? "selected" : ""}>Pending</option>
                <option ${order.status === "Shipped" ? "selected" : ""}>Shipped</option>
                <option ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
              </select>
              <button onclick="deleteOrder(${order.id})">❌</button>
            </td>
          </tr>
        `;
      });
    })
    .catch(() => {
      if (!isAdmin){
        alert("Please login as admin");
      window.location.href = "/auth.html";
}});
}

// ================================
// Update order status
// ================================
function updateStatus(id, status) {
  fetch("/api/orders/status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status })
  })
    .then(res => res.json())
    .then(() => loadOrders())
    .catch(() => alert("Failed to update status"));
}

// ================================
// Delete order
// ================================
function deleteOrder(id) {
  if (!confirm("Delete this order?")) return;

  fetch("/api/orders/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  })
    .then(res => res.json())
    .then(() => loadOrders())
    .catch(() => alert("Failed to delete order"));
}