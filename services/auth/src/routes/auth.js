import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "changeme";

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);
  await db.query(
    "INSERT INTO users (email, password_hash) VALUES ($1, $2)",
    [email, hash]
  );

  res.json({ message: "User registered" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await db.query("SELECT * FROM users WHERE email=$1", [email]);
  const user = result.rows[0];

  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, email }, JWT_SECRET);

  res.json({ token });
});

export default router;
