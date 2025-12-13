import express from "express";
import authRoutes from "./routes/auth.js";
import prefRoutes from "./routes/preferences.js";
import { initKafka } from "./kafka.js";

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/preferences", prefRoutes);

app.listen(3002, async () => {
  console.log("Auth & Preferences Service running on 3002");
  await initKafka();
});
