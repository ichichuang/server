import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createServer } from "net";
import { corsConfig } from "./config/cors.js";
import { env } from "./config/env.js";
import { errorHandler, onErrorHandler } from "./middleware/errorHandler.js";
import { servicesMiddleware } from "./middleware/services.js";
import { responseHandler } from "./middleware/responseHandler.js";
import { testRoutes } from "./api/test/test.js";
import { loginRoutes } from "./api/auth/login.js";
import { userInfoRoutes } from "./api/auth/userInfo.js";
import { routerRoutes } from "./api/auth/router.js";

// 创建 Hono 应用实例
const app = new Hono();

// 1. 首先注册错误处理中间件（必须在最前面，以捕获所有后续的错误）
app.use("*", errorHandler());

// 1.1 同时注册 onError 处理器作为最后的安全网（确保所有错误都被捕获）
app.onError(onErrorHandler);

// 2. 注册服务中间件（依赖注入）
app.use("*", servicesMiddleware());

// 3. 注册响应处理中间件（成功响应）
app.use("*", responseHandler());

// CORS 配置 - 支持前端跨域请求
app.use("*", cors(corsConfig));

// 注册测试路由
app.route("/", testRoutes);

// 注册认证相关路由
app.route("/", loginRoutes);
app.route("/", userInfoRoutes);
app.route("/", routerRoutes);

app.get("/", (c) => {
  return c.json({
    message: "ccd-server",
    description: "ccd-server api",
    endpoints: {},
    server: "ccd-server with Hono",
    timestamp: new Date().toISOString(),
  });
});

const port = env.port;

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

// 直接启动 Node.js 服务器（本地开发环境）
startServer();

