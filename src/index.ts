import { Hono } from "hono";
import { cors } from "hono/cors";
import { testRoutes } from "./test/test.js";

// 创建 Hono 应用实例
const app = new Hono();

// CORS 配置 - 支持前端跨域请求
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:8888",
      "https://www.server.wzdxcc.cloudns.org",
      "https://www.example.wzdxcc.cloudns.org",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers",
    ],
    credentials: true,
    maxAge: 86400, // 24 hours
  })
);

// 注册测试路由
app.route("/", testRoutes);

app.get("/", (c) => {
  return c.json({
    message: "ccd-server",
    description: "ccd-server api",
    endpoints: {},
    server: "ccd-server with Hono",
    timestamp: new Date().toISOString(),
  });
});

// Vercel 部署时，仅需要导出 app 实例
// Hono 框架使用标准的 Web API (Fetch API)，与 Vercel Serverless Function 完美兼容
export default app;
