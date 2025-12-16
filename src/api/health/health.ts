import { Hono } from "hono";

const healthRoutes = new Hono();

/**
 * 健康检查接口 - GET
 * GET /api/health
 * 也支持 HEAD 请求（通过 all 方法处理）
 */
healthRoutes.all("/api/health", async (c) => {
  // 如果是 HEAD 请求，返回空响应
  if (c.req.method === "HEAD") {
    return c.text("", 200);
  }

  // GET 请求返回完整信息
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

export { healthRoutes };

