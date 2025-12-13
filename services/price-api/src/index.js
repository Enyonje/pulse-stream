const express = require("express");
const app = express();
const PORT = process.env.PORT || 4000;

app.get("/price/:symbol", (req, res) => {
  const { symbol } = req.params;
  const fakePrice = (Math.random() * 100).toFixed(2);
  res.json({ symbol, price: fakePrice });
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`📈 Price API running on port ${PORT}`);
});