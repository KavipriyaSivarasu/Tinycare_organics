const express = require("express");
const { readData } = require("../utils/fileHandler");

const router = express.Router();
const ORDERS_FILE = "data/orders.json";

router.get("/orders", (req, res) => {
  const orders = readData(ORDERS_FILE);
  res.json(orders);
});

module.exports = router;
