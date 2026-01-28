fetch("http://localhost:5000/admin/dashboard")
  .then(res => res.json())
  .then(data => {
    document.getElementById("revenue").innerText =
      "Total Revenue: ₹" + data.totalRevenue;

    const tbody = document.getElementById("orders");

    tbody.innerHTML = data.orders.map(o => `
      <tr>
        <td>${o.userEmail}</td>
        <td>
          ${o.products.map(p =>
            `${p.product} × ${p.quantity}`
          ).join("<br>")}
        </td>
        <td>${o.amount}</td>
        <td>${o.paymentStatus}</td>
        <td>${o.orderStatus}</td>
      </tr>
    `).join("");
  });
fetch("http://localhost:5000/admin/orders")
.then(r=>r.json())
.then(d=>{
  d.forEach(o=>{
    document.body.innerHTML += `
      <p>${o.email} - ₹${o.total} - ${o.status}</p>`;
  });
});
