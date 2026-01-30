console.log("cart.js loaded");

let cart = [];

const cartItems = document.getElementById("cartItems");
const totalEl = document.getElementById("total");
const payBtn = document.getElementById("payBtn");

/* ---------- LOAD CART ---------- */
fetch("/api/cart")
  .then(res => res.json())
  .then(data => {
    cart = data;
    renderCart();
  });

/* ---------- RENDER ---------- */
function renderCart() {
  cartItems.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Cart is empty</p>";
    totalEl.innerText = "Total: ₹0";
    return;
  }

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

/* ---------- EVENTS ---------- */
cartItems.addEventListener("click", e => {
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

  fetch("/api/cart/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: item.id, qty: item.qty })
  });

  renderCart();
});

/* ---------- PAYMENT ---------- */
payBtn.onclick = () => {
  fetch("/api/checkout", { method: "POST" })
    .then(res => res.json())
    .then(data => {
      alert(data.msg);
      cart = [];
      renderCart();
    });
};