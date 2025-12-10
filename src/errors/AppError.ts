/**
 * 应用自定义错误类
 * 用于统一处理业务错误和 HTTP 错误响应
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    code?: string,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    // 保持正确的堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * 快速创建常用错误
   */
  static badRequest(message: string, code?: string): AppError {
    return new AppError(400, message, code);
  }

  static unauthorized(message: string = "未授权", code?: string): AppError {
    return new AppError(401, message, code);
  }

  static forbidden(message: string = "禁止访问", code?: string): AppError {
    return new AppError(403, message, code);
  }

  static notFound(message: string = "资源不存在", code?: string): AppError {
    return new AppError(404, message, code);
  }

  static conflict(message: string, code?: string): AppError {
    return new AppError(409, message, code);
  }

  static internal(message: string = "服务器内部错误", code?: string): AppError {
    return new AppError(500, message, code);
  }
}

