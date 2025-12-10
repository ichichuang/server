/**
 * 错误码常量定义
 * 用于统一管理错误码，便于前端处理
 */
export const ErrorCodes = {
  // 400 系列 - 客户端错误
  BAD_REQUEST: "ERR_BAD_REQUEST",
  VALIDATION_ERROR: "ERR_VALIDATION",
  MISSING_PARAMS: "ERR_MISSING_PARAMS",

  // 401 系列 - 认证错误
  UNAUTHORIZED: "ERR_UNAUTHORIZED",
  INVALID_TOKEN: "ERR_INVALID_TOKEN",
  TOKEN_EXPIRED: "ERR_TOKEN_EXPIRED",

  // 403 系列 - 权限错误
  FORBIDDEN: "ERR_FORBIDDEN",
  INSUFFICIENT_PERMISSIONS: "ERR_INSUFFICIENT_PERMISSIONS",

  // 404 系列 - 资源不存在
  NOT_FOUND: "ERR_NOT_FOUND",
  USER_NOT_FOUND: "ERR_USER_NOT_FOUND",

  // 500 系列 - 服务器错误
  INTERNAL_ERROR: "ERR_INTERNAL",
  DATABASE_ERROR: "ERR_DATABASE",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

