const express = require("express");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const path = require("path");

const app = express();

/* ---------------- MIDDLEWARE ---------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.set("trust proxy", 1);

app.use(
  session({
    name: "tinycare.sid",
    secret: "secret123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  })
);

/* ---------------- FILE SETUP ---------------- */
const USERS = "./data/users.json";
const CART = "./data/cart.json";

if (!fs.existsSync("./data")) fs.mkdirSync("./data");
if (!fs.existsSync(USERS)) fs.writeFileSync(USERS, "[]");
if (!fs.existsSync(CART)) fs.writeFileSync(CART, "[]");

/* ---------------- TEST ROUTE ---------------- */
app.get("/", (req, res) => {
  res.send("SERVER OK");
});

/* ---------------- REGISTER ---------------- */
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  const users = JSON.parse(fs.readFileSync(USERS));
  const exists = users.find((u) => u.email === email);
  if (exists) return res.status(400).json({ message: "User exists" });

  const hashed = bcrypt.hashSync(password, 10);
  users.push({ email, password: hashed });

  fs.writeFileSync(USERS, JSON.stringify(users));
  res.json({ message: "Registered" });
});

/* ---------------- LOGIN ---------------- */
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS));

  const user = users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ message: "Invalid login" });

  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid login" });

  req.session.user = email;
  res.json({ message: "Login success" });
});

/* ---------------- LOGOUT ---------------- */
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

/* ---------------- PORT (IMPORTANT) ---------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

/* ---------- CART ---------- */
app.post("/cart/add", (req, res) => {
  console.log("SESSION:", req.session.email);

  if (!req.session.email) {
    return res.status(401).json({ msg: "login required" });
  }

  const { product, price } = req.body;
  const cart = JSON.parse(fs.readFileSync(CART, "utf8"));

  const item = cart.find(
    i => i.email === req.session.email && i.product === product
  );

  if (item) item.qty++;
  else cart.push({
    email: req.session.email,
    product,
    price,
    qty: 1
  });

  fs.writeFileSync(CART, JSON.stringify(cart, null, 2));
  res.json({ msg: "added" });
});
app.get("/cart", (req, res) => {
  if (!req.session.email) {
    return res.status(401).json({ msg: "login required" });
  }

  const cart = JSON.parse(fs.readFileSync(CART, "utf8"));
  const userCart = cart.filter(
    item => item.email === req.session.email
  );

  res.json(userCart);
});
/* ---------- UPDATE QTY ---------- */
app.post("/cart/update", (req, res) => {
  if (!req.session.email) {
    return res.status(401).json({ msg: "login required" });
  }

  const { product, qty } = req.body;
  let cart = JSON.parse(fs.readFileSync(CART, "utf8"));

  cart = cart.map(i =>
    i.email === req.session.email && i.product === product
      ? { ...i, qty }
      : i
  ).filter(i => i.qty > 0);

  fs.writeFileSync(CART, JSON.stringify(cart, null, 2));
  res.json({ msg: "updated" });
});

/* ---------- REMOVE ITEM ---------- */
app.post("/cart/remove", (req, res) => {
  if (!req.session.email) {
    return res.status(401).json({ msg: "login required" });
  }

  const { product } = req.body;
  let cart = JSON.parse(fs.readFileSync(CART, "utf8"));

  cart = cart.filter(
    i => !(i.email === req.session.email && i.product === product)
  );

  fs.writeFileSync(CART, JSON.stringify(cart, null, 2));
  res.json({ msg: "removed" });
});
const ORDERS = "./data/orders.json";
if (!fs.existsSync(ORDERS)) fs.writeFileSync(ORDERS, "[]");


/* ---------- CHECKOUT ---------- */
app.post("/checkout", (req, res) => {
  if (!req.session.email) {
    return res.status(401).json({ msg: "login required" });
  }

  const cart = JSON.parse(fs.readFileSync(CART, "utf8"));
  const userCart = cart.filter(i => i.email === req.session.email);

  if (userCart.length === 0) {
    return res.json({ msg: "cart empty" });
  }

  const total = userCart.reduce(
    (sum, i) => sum + i.price * i.qty, 0
  );

  const orders = JSON.parse(fs.readFileSync(ORDERS, "utf8"));
  orders.push({
    email: req.session.email,
    items: userCart,
    total,
    status: "Paid",
    date: new Date().toLocaleString()
  });

  fs.writeFileSync(ORDERS, JSON.stringify(orders, null, 2));
  fs.writeFileSync(CART, "[]"); // clear cart

  res.json({ msg: "order placed" });
});
/* ---------- ADMIN ORDERS ---------- */
app.get("/admin/orders", (req, res) => {
  if (req.session.email !== "admin@gmail.com") {
    return res.status(403).json({ msg: "admin only" });
  }

  const ORDERS = "./data/orders.json";
  if (!fs.existsSync(ORDERS)) return res.json([]);

  const orders = JSON.parse(fs.readFileSync(ORDERS, "utf8"));
  res.json(orders);
});
/* ---------- UPDATE ORDER STATUS ---------- */
app.post("/admin/order/status", (req, res) => {
  if (req.session.email !== "admin@gmail.com") {
    return res.status(403).json({ msg: "admin only" });
  }

  const { id, status } = req.body;
  const ORDERS = "./data/orders.json";

  const orders = JSON.parse(fs.readFileSync(ORDERS, "utf8"));

  orders[id].status = status;

  fs.writeFileSync(ORDERS, JSON.stringify(orders, null, 2));
  res.json({ msg: "updated" });
});
app.get("/admin/revenue", (req, res) => {
  if (req.session.email !== "admin@gmail.com") {
    return res.status(403).json({ msg: "admin only" });
  }

  const ORDERS = "./data/orders.json";
  const orders = JSON.parse(fs.readFileSync(ORDERS, "utf8"));

  const total = orders.reduce((sum, o) => sum + o.total, 0);
  res.json({ total });
});

/* ---------- START ---------- */
app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
});
