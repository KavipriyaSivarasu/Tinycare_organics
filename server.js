
const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const ORDERS_FILE = "./orders.json";
const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "tinycare_secret",
  resave: false,
  saveUninitialized: true
}));

app.use(express.static("public"));

/* ---------- DATA (IN MEMORY) ---------- */
const users = [
  { email: "admin@tinycare.com", password: "admin123", role: "admin" }
];

let cart = [];

/* ---------- AUTH ---------- */
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: "Login required" });
  }
  next();
}

/* ---------- LOGIN ---------- */
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid login" });
  }

  req.session.user = user;
  res.json({ role: user.role });
});

/* ---------- REGISTER ---------- */
app.post("/api/register", (req, res) => {
  const { email, password } = req.body;

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: "User exists" });
  }

  users.push({ email, password, role: "user" });
  res.json({ message: "Account created" });
});

/* ---------- LOGOUT ---------- */
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

/* ---------- CART ---------- */
app.get("/api/cart", (req, res) => {
const cart=
JSON.parse(fs.readFileSync("cart.json","utf-8"))
res.json(cart);
});
/* ADD TO CART */
app.post("/api/cart/add", requireLogin, (req, res) => {
  const { id, name, price } = req.body;

  let item = cart.find(i => i.id === id);

  if (item) {
    item.qty++;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }

  res.json({ message: "Added to cart" });
});

/* UPDATE CART (+ / - / ×) */
app.post("/api/cart/update", requireLogin, (req, res) => {
  const { id, action } = req.body;

  const item = cart.find(i => i.id === id);
  if (!item) return res.json(cart);

  if (action === "plus") item.qty++;
  if (action === "minus") item.qty--;
  if (action === "remove") cart = cart.filter(i => i.id !== id);

  cart = cart.filter(i => i.qty > 0);
  res.json(cart);
});

/* ---------- PAYMENT ---------- */
app.post("/api/cart/pay", requireLogin, (req, res) => {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  cart = []; // clear cart after payment

  res.json({
    upi: "9788686860tinycare@upi",
    amount: total
  });
});
app.get("/api/admin/orders", (req, res) => {
  const orders = JSON.parse(fs.readFileSync(ORDERS_FILE));
  res.json(orders);
});
app.post("/api/order", (req, res) => {
  const orders = JSON.parse(fs.readFileSync(ORDERS_FILE));
  
  const newOrder = {
    id: Date.now(),
    email: req.session.user.email,
    items: req.body.items,
    total: req.body.total,
    payment: "UPI",
    status: "Pending"
  };

  orders.push(newOrder);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));

  res.json({ message: "Order placed successfully" });
});
app.post("/api/admin/update-status", (req, res) => {
  const { id, status } = req.body;

  const orders = JSON.parse(fs.readFileSync(ORDERS_FILE));
  const order = orders.find(o => o.id === id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = status;
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));

  res.json({ message: "Status updated" });
});
/* ---------- START SERVER ---------- */

  

const PORT=process.env.PORT || 3000;
app.listen(PORT, () => {
console.log("Server running on port",PORT);
  });