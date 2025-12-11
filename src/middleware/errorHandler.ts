import type { Context, Next } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import { z } from "zod";
import { AppError } from "../errors/AppError.js";
import { handleZodError } from "../validators/validatorErrorHandler.js";

/**
 * 全局错误处理中间件
 * 统一捕获和处理所有路由中的错误
 */
export const errorHandler = () => {
  return async (c: Context, next: Next) => {
    try {
      await next();
    } catch (error) {
      // 处理 Zod 验证错误（优先处理，因为验证错误会被转换为 AppError）
      if (error instanceof z.ZodError) {
        const appError = handleZodError(error);
        console.log(`[ErrorHandler] 捕获 ZodError: ${appError.message} (${appError.statusCode})`);
        c.status(appError.statusCode as StatusCode);
        return c.json({
          success: false,
          code: appError.code || `ERR_${appError.statusCode}`,
          message: appError.message,
          ...(process.env.NODE_ENV === "development" && {
            details: error.issues, // 开发环境显示详细错误
          }),
        });
      }

      // 处理自定义 AppError
      if (error instanceof AppError) {
        console.log(`[ErrorHandler] 捕获 AppError: ${error.message} (${error.statusCode})`);
        c.status(error.statusCode as StatusCode);
        return c.json({
          success: false,
          code: error.code || `ERR_${error.statusCode}`,
          message: error.message,
          ...(process.env.NODE_ENV === "development" && {
            stack: error.stack,
          }),
        });
      }

      // 处理其他未知错误
      console.error("[ErrorHandler] 未处理的错误:", error);
      console.error("[ErrorHandler] 错误类型:", error?.constructor?.name);
      console.error("[ErrorHandler] 错误详情:", error instanceof Error ? error.stack : String(error));

      const isDevelopment = process.env.NODE_ENV === "development";

      c.status(500 as StatusCode);
      return c.json({
        success: false,
        code: "ERR_INTERNAL",
        message: isDevelopment
          ? error instanceof Error
            ? error.message
            : "服务器内部错误"
          : "服务器内部错误",
        ...(isDevelopment && {
          stack: error instanceof Error ? error.stack : undefined,
        }),
      });
    }
  };
};

/**
 * Hono 的 onError 处理器（作为备用方案）
 * 如果中间件方式有问题，可以使用这个
 * 注意：onError 会在中间件错误处理之后执行，作为最后的安全网
 */
export const onErrorHandler = (error: Error, c: Context) => {
  console.log(`[OnErrorHandler] 捕获错误: ${error.message}`);
  console.log(`[OnErrorHandler] 错误类型: ${error?.constructor?.name}`);

  // 处理 Zod 验证错误
  if (error instanceof z.ZodError) {
    const appError = handleZodError(error);
    console.log(`[OnErrorHandler] 处理 ZodError: ${appError.message} (${appError.statusCode})`);
    c.status(appError.statusCode as StatusCode);
    return c.json({
      success: false,
      code: appError.code || `ERR_${appError.statusCode}`,
      message: appError.message,
      ...(process.env.NODE_ENV === "development" && {
        details: error.issues,
      }),
    });
  }

  // 处理自定义 AppError
  if (error instanceof AppError) {
    console.log(`[OnErrorHandler] 处理 AppError: ${error.message} (${error.statusCode})`);
    c.status(error.statusCode as StatusCode);
    return c.json({
      success: false,
      code: error.code || `ERR_${error.statusCode}`,
      message: error.message,
      ...(process.env.NODE_ENV === "development" && {
        stack: error.stack,
      }),
    });
  }

  // 处理其他未知错误
  console.error("[OnErrorHandler] 未处理的错误:", error);
  console.error("[OnErrorHandler] 错误堆栈:", error.stack);

  const isDevelopment = process.env.NODE_ENV === "development";

  c.status(500 as StatusCode);
  return c.json({
    success: false,
    code: "ERR_INTERNAL",
    message: isDevelopment
      ? error instanceof Error
        ? error.message
        : "服务器内部错误"
      : "服务器内部错误",
    ...(isDevelopment && {
      stack: error instanceof Error ? error.stack : undefined,
    }),
  });
};
