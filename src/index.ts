import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import usersRoute from "./routes/users.js";

const app = new Hono();

// Basic Middlewares
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: "*", // Allow all for demo purposes
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE"],
  }),
);

// Health check
app.get("/health", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString() }),
);

app.route("/api/v1/users", usersRoute);

export default app;
