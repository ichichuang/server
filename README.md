# CCD Server (Hono + TypeScript)

轻量后端服务，提供加密传输、统一验证/错误处理、依赖注入的业务分层，并配套单元测试与覆盖率门槛。

## 快速开始

```bash
pnpm install
pnpm dev          # 本地开发
pnpm build && pnpm start
```

## 主要能力

- **分层架构**：薄路由、厚服务（`src/services`），通用工具在 `src/libs`，配置集中 `src/config`。
- **依赖注入**：`servicesMiddleware` 注入 `c.services`，`responseHandler` 注入 `c.sendJson`。
- **请求验证**：Zod + `validator`，`c.req.valid()` 获取类型安全数据。
- **统一错误**：`AppError` + 全局 `errorHandler`，隐藏敏感信息。
- **加密传输**：`safeStorage` 支持 `isSafeStorage` 自动加解密；密钥来自 `env.appSecret`。
- **测试与覆盖率**：Vitest，覆盖率阈值聚焦服务层。

## 开发约定

请阅读完整指南：[`DEVELOPER_GUIDE.md`](./DEVELOPER_GUIDE.md)

核心要点：

- 路由只做 HTTP 流程，业务逻辑写在 `services`，通过 `c.services.*` 调用。
- 成功响应用 `c.sendJson(data, message)`；错误抛 `AppError.*`。
- 参数验证用 Zod Schema + `validator("json", schema)`。
- 配置从 `env.ts`/`cors.ts` 获取，不直接使用 `process.env`。

## 脚本

```bash
pnpm dev          # 开发
pnpm build        # 构建
pnpm start        # 运行构建产物
pnpm test         # 运行测试（watch）
pnpm test:run     # 一次性测试
pnpm coverage     # 覆盖率报告
```

## 目录速览

- `src/config`：env/cors 配置
- `src/libs`：通用工具（safeStorage、crypto、tokenManager 等）
- `src/services`：业务服务（authService 等）
- `src/middleware`：DI、响应、错误、验证中间件
- `src/auth`：路由入口（login/userInfo/routes）
- `src/validators`：Zod Schema 与错误处理
- `src/types`：全局类型扩展（如 Context augmentation）
