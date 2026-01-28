const fs = require("fs");

const readData = (file) => {
  if (!fs.existsSync(file)) return [];
  const data = fs.readFileSync(file, "utf-8");
  return data ? JSON.parse(data) : [];
};

const writeData = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

module.exports = { readData, writeData };
