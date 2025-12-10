import { Hono } from "hono";
import { getTokenFromHeader } from "../libs/tokenManager.js";
import type { UserInfo } from "./types.js";

const userInfoRoutes = new Hono();

/**
 * 获取用户信息接口
 * GET /auth/userInfo
 */
userInfoRoutes.get("/auth/userInfo", async (c) => {
  // ✅ 无需 try-catch，全局错误处理中间件会自动捕获

  // 从请求头获取 token
  const authHeader = c.req.header("Authorization");
  const token = getTokenFromHeader(authHeader);

  const userInfoResponse: UserInfo = await c.services.auth.getUserInfo(token);

  return c.json({
    success: true,
    data: userInfoResponse,
    message: "获取用户信息成功",
  });
});

export { userInfoRoutes };
