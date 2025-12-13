const express = require('express');
const app = express();
app.use(express.json());

let prefs = { theme: "dark", notifications: true };

app.get('/prefs', (req, res) => {
  res.json(prefs);
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});


app.post('/prefs', (req, res) => {
  prefs = { ...prefs, ...req.body };
  res.json({ status: "updated", prefs });
});

app.listen(3000, () => {
  console.log("User Prefs service running on port 3000");
});