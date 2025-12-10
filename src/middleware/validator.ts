import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { handleZodError } from "../validators/validatorErrorHandler.js";

/**
 * 自定义验证中间件
 * 验证失败时自动抛出 AppError，由全局错误处理中间件统一处理
 *
 * @param target 验证目标：'json' | 'query' | 'param' | 'form'
 * @param schema Zod Schema 对象
 * @returns Hono 中间件
 *
 * @example
 * ```typescript
 * loginRoutes.post(
 *   "/auth/login",
 *   validator("json", loginSchema),
 *   async (c) => {
 *     const { username, password } = c.req.valid("json");
 *     // username 和 password 已经是类型安全的
 *   }
 * );
 * ```
 */
export const validator = <T extends z.ZodTypeAny>(
  target: "json" | "query" | "param" | "form",
  schema: T
) => {
  return zValidator(target, schema, (result, c) => {
    if (!result.success) {
      // 验证失败时抛出 AppError，由全局错误处理中间件捕获
      const zodError =
        result.error instanceof z.ZodError
          ? result.error
          : new z.ZodError(result.error.issues);
      throw handleZodError(zodError);
    }
  });
};
