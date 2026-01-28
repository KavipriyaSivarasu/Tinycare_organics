function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch("http://localhost:5000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.msg === "admin") {
      window.location.href = "admin.html";
    } else if (data.msg === "user") {
      window.location.href = "index.html?email=" + email;
    } else {
      alert("Invalid login");
    }
  })
  .catch(err => {
    alert("Server not reachable");
    console.error(err);
  });
}
function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch("http://localhost:5000/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => alert(data.msg))
  .catch(() => alert("Server not reachable"));
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch("http://localhost:5000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.msg === "user" || data.msg === "admin") {
      window.location.href = "index.html?email=" + encodeURIComponent(email);
    } else {
      alert("Invalid login");
    }
  })
  .catch(() => alert("Server error"));
}
