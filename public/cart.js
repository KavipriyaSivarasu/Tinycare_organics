alert("cart.js loaded");

let cart = [];

const cartItemsDiv = document.getElementById("cartItems");
const totalEl = document.getElementById("total");
const payBtn = document.getElementById("payBtn");

/* =====================
   LOAD CART FROM SERVER
===================== */
fetch("/api/cart")
  .then(res => res.json())
  .then(data => {
    cart = data;
    renderCart();
  });

/* =====================
   RENDER CART
===================== */
function renderCart() {
  cartItemsDiv.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = "<p>Cart is empty</p>";
    totalEl.innerText = "Total: ₹0";
    return;
  }

  cart.forEach(item => {
    total += item.price * item.qty;

    cartItemsDiv.innerHTML += `
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

/* =====================
   + / - / REMOVE
===================== */
cartItemsDiv.addEventListener("click", e => {
  const box = e.target.closest(".item");
  if (!box) return;

  const id = Number(box.dataset.id);
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

/* =====================
   PAYMENT / CHECKOUT
===================== */
payBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

  fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: cart,
      total: cart.reduce((s, i) => s + i.price * i.qty, 0),
      payment: "UPI 9788686860"
    })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.msg || "Order placed");
    cart = [];
    renderCart();
  });
});