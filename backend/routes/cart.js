const express = require("express");
const fs = require("fs");
const router = express.Router();

const CART_FILE = "./data/cart.json";

/* helpers */
const readCart = () => {
  if (!fs.existsSync(CART_FILE)) return [];
  return JSON.parse(fs.readFileSync(CART_FILE));
};

const writeCart = (data) => {
  fs.writeFileSync(CART_FILE, JSON.stringify(data, null, 2));
};

/* ---------------- ADD TO CART ---------------- */
router.post("/add", (req, res) => {
  const { email, product, price } = req.body;

  if (!email) return res.json({ msg: "email missing" });

  let cart = readCart();

  const item = cart.find(
    i => i.email === email && i.product === product
  );

  if (item) {
    item.qty += 1;
  } else {
    cart.push({
      email,
      product,
      price,
      qty: 1
    });
  }

  writeCart(cart);
  res.json({ msg: "added" });
});

/* ---------------- GET CART ---------------- */
router.get("/:email", (req, res) => {
  const cart = readCart();
  const userCart = cart.filter(i => i.email === req.params.email);
  res.json(userCart);
});

/* ---------------- REMOVE ITEM ---------------- */
router.post("/remove", (req, res) => {
  const { email, product } = req.body;
  let cart = readCart();

  cart = cart.filter(
    i => !(i.email === email && i.product === product)
  );

  writeCart(cart);
  res.json({ msg: "removed" });
});

/* ---------------- UPDATE QTY ---------------- */
router.post("/update", (req, res) => {
  const { email, product, qty } = req.body;
  let cart = readCart();

  cart.forEach(i => {
    if (i.email === email && i.product === product) {
      i.qty = qty;
    }
  });

  writeCart(cart);
  res.json({ msg: "updated" });
});

module.exports = router;
