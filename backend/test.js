const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("SERVER OK"));

app.listen(5000, () => console.log("TEST SERVER RUNNING"));
