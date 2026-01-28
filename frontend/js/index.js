const email = new URLSearchParams(window.location.search).get("email");
function addToCart(product, price) {
  const email = new URLSearchParams(window.location.search).get("email");

  if (!email) {
    alert("Login required");
    window.location.href = "auth.html";
    return;
  }

  fetch("http://localhost:5000/cart/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, product, price })
  })
  .then(res => res.json())
  .then(() => alert("Added to cart"))
  .catch(() => alert("Server error"));
}
