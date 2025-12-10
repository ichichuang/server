import { Hono } from "hono";
import { getTokenFromHeader } from "../libs/tokenManager.js";

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

  // 直接返回路由数组，前端拦截器会提取 data 字段
  return c.sendJson(routes, "获取路由成功");
});

export { routerRoutes };
