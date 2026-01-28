const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const USERS_FILE = path.join(__dirname, "../data/users.json");

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE));
}

function writeUsers(data) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

// REGISTER
router.post("/register", (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();

  if (users.find(u => u.email === email)) {
    return res.json({ msg: "exists" });
  }

  const hash = bcrypt.hashSync(password, 10);
  users.push({ email, password: hash });

  writeUsers(users);
  res.json({ msg: "success" });
});

// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();

  const user = users.find(u => u.email === email);
  if (!user) return res.json({ msg: "invalid" });

  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) return res.json({ msg: "invalid" });

  // ADMIN CHECK
  if (email === "admin@gmail.com") {
    return res.json({ msg: "admin" });
  }

  res.json({ msg: "user" });
});

module.exports = router;
