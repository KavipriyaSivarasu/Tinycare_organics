function addToCart(id, name, price) {
  fetch("/api/cart/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, name, price }),
  })
    .then((res) => {
      if (!res.ok) {
        alert("Please login first");
        return;
      }
      return res.json();
    })
    .then((data) => {
      if (data) {
        alert("Product added to cart ✅");
      }
    })
    .catch(() => {
      alert("Server error");
    });
}