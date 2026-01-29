function addToCart(id, name, price) {
  fetch("/api/cart/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, name, price })
  })
  .then(res => {
    if (res.status === 401) {
      alert("Please login first");
      window.location.href = "auth.html";
      return;
    }
    return res.json();
  })
  .then(data => {
    if (data) alert(data.message);
  });
}