
const express = require("express");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const session = require("express-session");

const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(express.json());
app.use(express.static("public")); // 🔥 SERVE HTML FILES

app.use(session({
  secret: "secret123",
  resave: false,
  saveUninitialized: false,
  cookie: { sameSite: "lax" }
}));

/* ---------- FILE PATHS ---------- */
const USERS = "./data/users.json";
const CART = "./data/cart.json";

/* ---------- ENSURE FILES EXIST ---------- */
if (!fs.existsSync("./data")) fs.mkdirSync("./data");
if (!fs.existsSync(USERS)) fs.writeFileSync(USERS, "[]");
if (!fs.existsSync(CART)) fs.writeFileSync(CART, "[]");

/* ---------- TEST ---------- */
app.get("/", (req, res) => res.send("SERVER OK"));

/* ---------- REGISTER ---------- */
app.post("/register", (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("REGISTER:", email);

    const users = JSON.parse(fs.readFileSync(USERS, "utf8"));

    if (users.find(u => u.email === email)) {
      return res.json({ msg: "exists" });
    }

    users.push({
      email,
      password: bcrypt.hashSync(password, 10)
    });

    fs.writeFileSync(USERS, JSON.stringify(users, null, 2));
    res.json({ msg: "registered" });

  } catch (e) {
    console.error("REGISTER ERROR:", e);
    res.status(500).json({ msg: "server error" });
  }
});

/* ---------- LOGIN ---------- */
app.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("LOGIN:", email);

    if (email === "admin@gmail.com" && password === "admin123") {
      req.session.email = email;
      return res.json({ msg: "admin" });
    }

    const users = JSON.parse(fs.readFileSync(USERS, "utf8"));
    const user = users.find(u => u.email === email);

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.json({ msg: "invalid" });
    }

    req.session.email = email;
    res.json({ msg: "user" });

  } catch (e) {
    console.error("LOGIN ERROR:", e);
    res.status(500).json({ msg: "server error" });
  }
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
