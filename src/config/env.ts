/**
 * 环境变量集中管理
 * 提供类型安全的配置读取
 */

const parseOrigins = (raw?: string): string[] => {
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const NODE_ENV = process.env.NODE_ENV ?? "development";

export const env = {
  nodeEnv: NODE_ENV,
  isDev: NODE_ENV === "development",
  isProd: NODE_ENV === "production",
  /**
   * 加密密钥，保持与前端一致
   */
  appSecret:
    process.env.APP_SECRET ??
    (NODE_ENV === "production" ? "ccd-secret-pro" : "ccd-secret-dev"),
  /**
   * 服务端口
   */
  port: Number(process.env.PORT ?? 3003),
  /**
   * CORS 允许的 origin，逗号分隔
   */
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS),
} as const;

export type EnvConfig = typeof env;

