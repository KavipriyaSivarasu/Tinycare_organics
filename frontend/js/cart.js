fetch("http://localhost:5000/cart", {
  credentials: "include"
})
.then(res => {
  if (res.status === 401) {
    document.getElementById("cartBox").innerHTML = "Login required";
    return;
  }
  return res.json();
})
.then(items => {
  if (!items || items.length === 0) {
    document.getElementById("cartBox").innerHTML = "Cart is empty";
    return;
  }

  let total = 0;
  items.forEach(i => {
    total += i.price * i.qty;
    document.getElementById("cartBox").innerHTML += `
      <p>${i.product} - ₹${i.price} × ${i.qty}</p>
    `;
  });

  document.getElementById("cartBox").innerHTML += `<h3>Total: ₹${total}</h3>`;
});
 