fetch("/api/admin/orders")
  .then(res => res.json())
  .then(data => {
    const table = document.getElementById("ordersTable");
    table.innerHTML = "";

    if (data.length === 0) {
      table.innerHTML = "<tr><td colspan='6'>No Orders</td></tr>";
      return;
    }

    data.forEach(order => {
      const items = order.items
        .map(i => `${i.name} × ${i.qty}`)
        .join("<br>");

      table.innerHTML += `
        <tr>
          <td>${order.email}</td>
          <td>${items}</td>
          <td>₹${order.total}</td>
          
          <td>${order.status}</td>
          <td>
            <select onchange="updateStatus(${order.id}, this.value)">
              <option>Pending</option>
              <option>Shipped</option>
              <option>Delivered</option>
            </select>
          </td>
        </tr>
      `;
    });
  });

function updateStatus(id, status) {
  fetch("/api/admin/status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status })
  })
  .then(() => alert("Status updated"));
}