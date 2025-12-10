import type { Services } from "../services/index.js";

declare module "hono" {
  interface Context {
    /**
     * 全局注入的业务服务（通过 servicesMiddleware）
     */
    services: Services;
    /**
     * 全局注入的响应封装（通过 responseHandler）
     */
    sendJson: (data: Record<string, any>, message?: string) => Response;
  }
}

