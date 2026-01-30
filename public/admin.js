fetch("/api/admin/orders")
  .then(res => res.json())
  .then(orders => {
    const tbody = document.getElementById("orders");
    const revenueBox = document.getElementById("revenue");

    let revenue = 0;

    orders.forEach(o => {
      revenue += o.total;

      const products = o.items
        .map(i => `${i.name} (${i.qty})`)
        .join("<br>");

      tbody.innerHTML += `
        <tr>
          <td>${o.email}</td>
          <td>${products}</td>
          <td>₹${o.total}</td>
          <td>${o.payment}</td>
          <td>${o.status}</td>
          <td>${new Date(o.date).toLocaleString()}</td>
        </tr>
      `;
    });

    revenueBox.innerText = "Total Revenue: ₹" + revenue;
  })
  .catch(err => {
    alert("Admin access only");
    location.href = "/index.html";
  });