import pkg from "pg";
const { Pool } = pkg;

export const db = new Pool({
  host: process.env.DB_HOST || "postgres",
  user: process.env.DB_USER || "pulse",
  password: process.env.DB_PASS || "password",
  database: process.env.DB_NAME || "pulse_db",
});
