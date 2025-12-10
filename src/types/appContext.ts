import type { Context } from "hono";
import type { Services } from "../services/index.js";

/**
 * 应用级 Context 类型
 * - sendJson: 全局响应封装（自动处理 isSafeStorage 加密）
 * - services: 依赖注入的业务服务
 */
export type AppContext = Context & {
  sendJson: (data: Record<string, any>, message?: string) => Response;
  services: Services;
};

/**
 * 类型守卫：确保 Context 已挂载 sendJson 和 services
 * 在路由中调用后，c 会被收窄为 AppContext
 */
// 可选的类型守卫（当前通过模块声明已扩展 Context）
export const assertAppContext = (c: Context): asserts c is AppContext => {
  return;
};

