import { env } from "./env.js";

const DEFAULT_ORIGINS = [
  "http://localhost:8888",
  "https://www.server.wzdxcc.cloudns.org",
  "https://www.example.wzdxcc.cloudns.org",
] as const;

const DEFAULT_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"];

const DEFAULT_HEADERS = [
  "Content-Type",
  "Authorization",
  "X-Requested-With",
  "Accept",
  "Origin",
  "Access-Control-Request-Method",
  "Access-Control-Request-Headers",
] as const;

export const corsConfig = {
  origin: env.corsOrigins.length > 0 ? env.corsOrigins : [...DEFAULT_ORIGINS],
  allowMethods: [...DEFAULT_METHODS],
  allowHeaders: [...DEFAULT_HEADERS],
  credentials: true,
  maxAge: 86400,
};

export type CorsConfig = typeof corsConfig;

