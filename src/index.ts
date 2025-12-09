import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createServer } from "net";
import { testRoutes } from "./test/test";

// 创建 Hono 应用实例
const app = new Hono();

// CORS 配置 - 支持前端跨域请求
app.use(
  "*",
  cors({
    origin: ["http://localhost:8888", "https://www.example.wzdxcc.cloudns.org"],
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

const port = parseInt(process.env.PORT || "3003");
const isVercel = process.env.VERCEL === "1";

// 检查端口是否可用
const checkPort = (targetPort: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = createServer();
    server.unref();

    server.once("error", () => {
      resolve(false);
    });

    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(targetPort, "0.0.0.0");
  });
};

// 查找可用端口
const findAvailablePort = async (startPort: number): Promise<number> => {
  let port = startPort;
  while (!(await checkPort(port))) {
    port++;
    if (port > startPort + 100) {
      throw new Error("无法找到可用端口");
    }
  }
  return port;
};

// 启动服务器
const startServer = async () => {
  try {
    const availablePort = await findAvailablePort(port);

    console.log(`🚀 服务器运行在 http://localhost:${availablePort}`);
    // 测试 get
    console.log(`🤖 test get: http://localhost:${availablePort}/test/get`);

    serve({
      fetch: app.fetch,
      port: availablePort,
    });
  } catch (error) {
    console.error("启动服务器失败:", error);
    process.exit(1);
  }
};

if (!isVercel) {
  startServer();
}

// Vercel 需要导出 fetch 处理器
export default {
  fetch: app.fetch,
};
