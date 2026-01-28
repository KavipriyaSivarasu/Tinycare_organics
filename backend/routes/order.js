router.post("/place", (req, res) => {
  const { email, items, total } = req.body;

  const orders = readData(ORDERS);
  orders.push({
    email,
    items,
    total,
    payment: "Paid",
    status: "Processing"
  });

  writeData(ORDERS, orders);
  writeData(CART, {}); // clear cart

  res.json({ msg: "order placed" });
});
