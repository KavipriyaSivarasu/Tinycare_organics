alert("cart.js loaded");

let cart = [];
fetch("/api/cart")
.then(res =>res.json())
.then(data =>{
  cart =data;
  renderCart();
});
const email = sessionStorage.getItem("email"); // login-only identifier

fetch(`/api/cart/${email}`)
  .then(res => res.json())
  .then(cart => renderCart(cart));

const cartItems = document.getElementById("cartItems");
const totalEl = document.getElementById("total");

function renderCart() {
  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    total += item.price * item.qty;

    cartItems.innerHTML += `
      <div class="item" data-id="${item.id}">
        <b>${item.name}</b><br>
        ₹${item.price} × ${item.qty}<br>
        <button class="plus">+</button>
        <button class="minus">-</button>
        <button class="remove">×</button>
      </div>
    `;
  });

  totalEl.innerText = "Total: ₹" + total;
}

// 🔥 EVENT DELEGATION (THIS IS THE FIX)
cartItems.addEventListener("click", function (e) {
  const itemDiv = e.target.closest(".item");
  if (!itemDiv) return;

  const id = Number(itemDiv.dataset.id);
  const item = cart.find(i => i.id === id);

  if (e.target.classList.contains("plus")) {
    item.qty++;
  }

  if (e.target.classList.contains("minus")) {
    if (item.qty > 1) item.qty--;
  }

  if (e.target.classList.contains("remove")) {
    cart = cart.filter(i => i.id !== id);
  }

  renderCart();
});

// Pay button
document.getElementById("payBtn").onclick = () => {
  alert("UPI Payment Initiated");
};

renderCart();
fetch("/api/order/place", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: userEmail,
    cart: cartItems,
    total: totalAmount
  })
});
function placeOrder() {
  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }
fetch("/api/checkout", { method: "POST" })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    location.reload();
  });
  fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: cart,
      total: cart.reduce((s, i) => s + i.price * i.qty, 0),
      status: "Paid"
    })
  })
  .then(res => res.json())
  .then(() => {
    alert("Order placed successfully");
    cart = [];
    renderCart();
  });
}