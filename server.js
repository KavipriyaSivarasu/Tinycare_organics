const express = require("express");
const fs = require("fs");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

/* ---------- middleware ---------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: "tinycare-secret",
  resave: false,
  saveUninitialized: false
}));

/* ---------- files ---------- */
const DATA = path.join(__dirname, ".data");
const USERS = path.join(DATA, "users.json");
const CART = path.join(DATA, "cart.json");
const ORDERS = path.join(DATA, "orders.json");

if (!fs.existsSync(DATA)) fs.mkdirSync(DATA);
if (!fs.existsSync(USERS)) fs.writeFileSync(USERS, "[]");
if (!fs.existsSync(CART)) fs.writeFileSync(CART, "[]");
if (!fs.existsSync(ORDERS)) fs.writeFileSync(ORDERS, "[]");

const read = f => JSON.parse(fs.readFileSync(f, "utf-8"));
const write = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2));

/* ---------- test ---------- */
app.get("/api/test", (req, res) => {
  res.json({ status: "API WORKING" });
});

/* ---------- auth ---------- */
app.post("/api/register", (req, res) => {
  const { email, password } = req.body;
  const users = read(USERS);

  if (users.find(u => u.email === email)) {
    return res.json({ msg: "exists" });
  }

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

  if (email === "admin@gmail.com" && password === "admin123") {
    req.session.user = { email, role: "admin" };
    return res.json({ role: "admin" });
  }

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) return res.json({ msg: "invalid" });

  req.session.user = { email: user.email, role: "user" };
  res.json({ role: "user" });
});

/* ---------- cart ---------- */
app.post("/api/cart/add", (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ msg: "login required" });

  const { name, price } = req.body;
  let cart = read(CART);

  const item = cart.find(
    i => i.email === req.session.user.email && i.name === name
  );

  if (item) {
    item.qty++;
  } else {
    cart.push({
      id: Date.now(),
      email: req.session.user.email,
      name,
      price,
      qty: 1
    });
  }

  write(CART, cart);
  res.json({ msg: "added" });
});

app.get("/api/cart", (req, res) => {
  if (!req.session.user) return res.json([]);

  const cart = read(CART).filter(
    i => i.email === req.session.user.email
  );

  res.json(cart);
});

app.post("/api/cart/update", (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ msg: "login required" });

  const { name, qty } = req.body;
  let cart = read(CART);

  cart = cart
    .map(i => {
      if (
        i.email === req.session.user.email &&
        i.name === name
      ) {
        return { ...i, qty };
      }
      return i;
    })
    .filter(i => i.qty > 0);

  write(CART, cart);
  res.json({ msg: "updated" });
});

/* ---------- checkout ---------- */
app.post("/api/checkout", (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ msg: "login required" });

  const cart = read(CART).filter(
    i => i.email === req.session.user.email
  );

  if (cart.length === 0)
    return res.json({ msg: "cart empty" });

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
    status: "Paid",
    date: new Date().toISOString()
  });

  write(ORDERS, orders);

  const remaining = read(CART).filter(
    i => i.email !== req.session.user.email
  );
  write(CART, remaining);

  res.json({ msg: "order placed" });
});

/* ---------- admin ---------- */
// ---------- ADMIN ORDERS ----------
app.get("/api/admin/orders", (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(401).json({ msg: "admin only" });
  }

  const orders = read(ORDERS);
  res.json(orders);
});
/* ---------- start ---------- */
app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});