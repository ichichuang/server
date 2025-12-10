import { Hono } from "hono";
import { validator } from "../middleware/validator.js";
import { loginSchema } from "../validators/schemas/authSchemas.js";
import type { LoginResponse } from "./types.js";
import type { LoginSchema } from "../validators/schemas/authSchemas.js";

const loginRoutes = new Hono();

/**
 * 用户登录接口
 * POST /auth/login
 */
loginRoutes.post(
  "/auth/login",
  // ✅ Zod 验证中间件：自动验证请求体，验证失败自动返回 400
  validator("json", loginSchema),
  async (c) => {
    // ✅ 验证通过后，c.req.valid("json") 返回已验证且类型安全的数据
    const { username, password } = c.req.valid("json") as LoginSchema;

    const response: LoginResponse = await c.services.auth.login(
      username,
      password
    );

    // ✅ 使用全局中间件注入的 sendJson 方法，自动处理加密
    return c.sendJson(response, "登录成功");
  }
);

export { loginRoutes };
