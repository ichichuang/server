import type { Context, Next } from "hono";
import type { Services } from "../services/index.js";
import { createServices } from "../services/index.js";
import type { AppContext } from "../types/appContext.js";

export const servicesMiddleware = () => {
  return async (c: Context, next: Next) => {
    const services = createServices();
    // 存储到 Hono 变量（便于 c.get）
    c.set("services", services);
    // 同时挂载到 Context，便于类型化访问
    (c as AppContext).services = services;
    await next();
  };
};

export const getServices = (c: Context): Services => {
  const fromCtx = (c as Partial<AppContext>).services;
  if (fromCtx) return fromCtx;
  return c.get("services") as Services;
};

