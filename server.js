const express = require("express");
const fs = require("fs");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = 3000;

// ---------- middleware ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "tinycare-secret",
  resave: false,
  saveUninitialized: false
}));

app.use(express.static("public"));

// ---------- files ----------
const DATA = "./data";
const USERS = DATA + "/users.json";
const CART = DATA + "/cart.json";
const ORDERS = DATA + "/orders.json";

if (!fs.existsSync(DATA)) fs.mkdirSync(DATA);
if (!fs.existsSync(USERS)) fs.writeFileSync(USERS, "[]");
if (!fs.existsSync(CART)) fs.writeFileSync(CART, "[]");
if (!fs.existsSync(ORDERS)) fs.writeFileSync(ORDERS, "[]");

const read = f => JSON.parse(fs.readFileSync(f));
const write = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2));

// ---------- test ----------
app.get("/api/test", (req, res) => {
  res.json({ status: "API WORKING" });
});

// ---------- auth ----------
app.post("/api/register", (req, res) => {
  const { email, password } = req.body;
  const users = read(USERS);

  if (users.find(u => u.email === email))
    return res.json({ msg: "exists" });

  users.push({
    email,
    password,
    role: email === "admin@gmail.com" ? "admin" : "user"
  });

  write(USERS, users);
  res.json({ msg: "registered" });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const users = read(USERS);

  // 🔐 HARD-CODED ADMIN
  if (email === "admin@gmail.com" && password === "admin123") {
    req.session.user = {
      email,
      role: "admin"
    };
    return res.json({ role: "admin" });
  }

  // 👤 NORMAL USER
  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    return res.json({ msg: "invalid" });
  }

  req.session.user = {
    email: user.email,
    role: "user"
  };

  res.json({ role: "user" });
});

// ---------- cart ----------
app.post("/api/cart/add", (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ msg: "login required" });

  const { name, price } = req.body;
  let cart = read(CART);

  const item = cart.find(
    i => i.email === req.session.user.email && i.name === name
  );

  if (item) item.qty++;
  else cart.push({
    email: req.session.user.email,
    name,
    price,
    qty: 1
  });

  write(CART, cart);
  res.json({ msg: "added" });
});

app.get("/api/cart", (req, res) => {
  if (!req.session.user)
    return res.status(401).json([]);

  const cart = read(CART).filter(
    i => i.email === req.session.user.email
  );

  res.json(cart);
});

app.post("/api/cart/update", (req, res) => {
  let cart = read(CART);
  const { name, qty } = req.body;

  cart = cart.map(i =>
    i.name === name ? { ...i, qty } : i
  ).filter(i => i.qty > 0);

  write(CART, cart);
  res.json({ msg: "updated" });
});

// ---------- checkout ----------
app.post("/api/checkout", (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ msg: "login required" });

  const cart = read(CART).filter(
    i => i.email === req.session.user.email
  );

  const total = cart.reduce(
    (s, i) => s + i.price * i.qty, 0
  );

  const orders = read(ORDERS);
  orders.push({
    id: Date.now(),
    email: req.session.user.email,
    items: cart,
    total,
    payment: "UPI 9788686860",
    status: "Paid"
  });

  write(ORDERS, orders);
  write(CART, []);

  res.json({ msg: "order placed" });
});

// ---------- admin ----------
app.get("/api/admin/orders", (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin")
    return res.status(401).json([]);

  res.json(read(ORDERS));
});

// ---------- start ----------
app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});