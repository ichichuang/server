import { Hono } from "hono";
import { cors } from "hono/cors";
import { corsConfig } from "./config/cors.js";
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

// 注意：请求解密逻辑已集成到 validator 中间件中，无需单独注册全局中间件

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

// Vercel 部署时，仅需要导出 app 实例
// Hono 框架使用标准的 Web API (Fetch API)，与 Vercel Serverless Function 完美兼容
export default app;
