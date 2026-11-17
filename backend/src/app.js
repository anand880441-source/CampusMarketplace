
const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Campus Marketplace API is running!"
  });
});

module.exports = app;
