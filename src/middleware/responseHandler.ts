import type { Context, Next } from "hono";
import type { AppContext } from "../types/appContext.js";
import { processResponseData } from "../libs/responseEncrypt.js";

/**
 * 扩展 Hono Context 的类型，加入自定义的响应方法
 */
export type EncryptedContext = AppContext;

/**
 * 响应处理中间件：为 Context 注入自定义的 JSON 响应方法
 * 这个方法会自动进行 isSafeStorage 加密判断
 */
export const responseHandler = () => {
  return async (c: Context, next: Next) => {
    // 注入 sendJson 方法到 Context 中（使用类型断言）
    (c as AppContext).sendJson = (data, message = "success") => {
      // 1. 调用加密转换逻辑（自动检测 isSafeStorage 并加密）
      const processedData = processResponseData(data);

      // 2. 返回统一格式的 JSON 响应
      return c.json({
        success: true,
        data: processedData,
        message: message,
      });
    };

    // 继续处理后续路由
    await next();
  };
};
