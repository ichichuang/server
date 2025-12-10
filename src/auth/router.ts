import { Hono } from "hono";
import { getTokenFromHeader } from "./tokenManager.js";

const routerRoutes = new Hono();

/**
 * 获取动态路由接口
 * GET /auth/routes
 */
routerRoutes.get("/auth/routes", async (c) => {
  // ✅ 无需 try-catch，全局错误处理中间件会自动捕获

  // 从请求头获取 token
  const authHeader = c.req.header("Authorization");
  const token = getTokenFromHeader(authHeader);

  const routes = await c.services.auth.getRoutes(token);

  return c.sendJson(
    {
      routes,
      isSafeStorage: false,
    },
    "获取路由成功"
  );
});

export { routerRoutes };
