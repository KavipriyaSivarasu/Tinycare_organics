function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch("http://localhost:5000/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.msg === "success") {
      alert("Registered successfully");
      window.location.href = "auth.html";
    } else if (data.msg === "exists") {
      alert("User already exists");
    } else {
      alert("Register failed");
    }
  })
  .catch(() => alert("Server not reachable"));
}
