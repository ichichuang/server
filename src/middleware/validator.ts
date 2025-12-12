import type { Context, Next } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { handleZodError } from "../validators/validatorErrorHandler.js";
import { processRequestData } from "../libs/requestDecrypt.js";

/**
 * 自定义验证中间件
 * 集成请求解密和数据验证功能
 * - 自动检测并解密带有 isSafeStorage: true 的请求数据
 * - 验证失败时自动抛出 AppError，由全局错误处理中间件统一处理
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
 *     // username 和 password 已经是类型安全且已解密的
 *   }
 * );
 * ```
 */
export const validator = <T extends z.ZodTypeAny>(
  target: "json" | "query" | "param" | "form",
  schema: T
) => {
  // 如果是 JSON 验证，需要先解密数据（如果有加密）
  if (target === "json") {
    return async (c: Context, next: Next) => {
      try {
        // 读取请求体
        const rawBody = await c.req.json().catch(() => null);

        if (!rawBody) {
          throw new Error("请求体为空");
        }

        // 检查是否需要解密
        let bodyToValidate: any = rawBody;

        if (rawBody.isSafeStorage === true) {
          try {
            // 使用解密逻辑处理数据
            bodyToValidate = processRequestData(rawBody);
          } catch (decryptError) {
            throw new Error(
              `请求数据解密失败: ${
                decryptError instanceof Error
                  ? decryptError.message
                  : String(decryptError)
              }`
            );
          }
        }

        // 验证数据
        const validationResult = schema.safeParse(bodyToValidate);

        if (!validationResult.success) {
          // safeParse 返回的 error 已经是 ZodError 类型
          throw handleZodError(validationResult.error);
        }

        // 设置验证后的数据，供 c.req.valid("json") 使用
        const validatedData = validationResult.data;

        // 直接修改 c.req.valid 方法（不替换整个 req 对象）
        (c.req as any).valid = (validationTarget: string) => {
          if (validationTarget === "json") {
            return validatedData;
          }
          return undefined;
        };

        await next();
      } catch (error) {
        throw error;
      }
    };
  }

  // 非 JSON 验证，直接使用原始验证器
  return zValidator(target, schema, (result) => {
    if (!result.success) {
      // safeParse 返回的 error 已经是 ZodError 类型
      throw handleZodError(result.error as any);
    }
  });
};
