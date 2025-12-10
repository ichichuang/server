import { z } from "zod";
import { AppError } from "../errors/AppError.js";
import { ErrorCodes } from "../errors/errorCodes.js";

/**
 * 将 Zod 验证错误转换为 AppError
 * 用于在验证失败时抛出统一的业务错误
 */
export function handleZodError<T>(error: z.ZodError<T>): AppError {
  // 获取第一个错误信息（通常是最重要的）
  const firstError = error.issues[0];

  // 构建详细的错误消息
  const errorMessages = error.issues.map((err) => {
    const path = err.path.join(".");
    return path ? `${path}: ${err.message}` : err.message;
  });

  const message =
    error.issues.length === 1
      ? firstError.message
      : `验证失败: ${errorMessages.join("; ")}`;

  return AppError.badRequest(message, ErrorCodes.VALIDATION_ERROR);
}

/**
 * 自定义 Zod 错误格式化函数
 * 用于在验证中间件中生成友好的错误消息
 */
export function formatZodError<T>(error: z.ZodError<T>): string {
  const errors = error.issues.map((err) => {
    const path = err.path.length > 0 ? err.path.join(".") : "根对象";
    return `${path}: ${err.message}`;
  });

  return errors.join("; ");
}
