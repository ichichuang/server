# DEVELOPER_GUIDE

后端开发约定（Hono + TypeScript）

## 架构与分层

- 薄路由、厚服务：业务逻辑放在 `src/services/*`，路由只做 HTTP 接入。
- DI：`servicesMiddleware` 将 services 注入到 `Context`，`src/types/hono.d.ts` 已扩展 `c.services`、`c.sendJson`。
- 通用工具：`src/libs/*`（加密、压缩等），配置集中 `src/config/*`。

## 请求验证

- 使用 Zod Schema（`src/validators/schemas/*`）+ `validator("json", schema)`。
- 在路由中直接：`const data = (c.req as any).valid("json")`，无需手动校验。
- **自动解密**: `validator` 中间件会自动检测并解密带有 `isSafeStorage: true` 的请求数据。
- 验证失败由全局 `errorHandler` 捕获并返回 `ERR_VALIDATION` 400。
- **注意**：登录接口的密码验证不检查长度（只检查非空），密码长度验证应在注册接口中使用。

### 使用示例

```typescript
// 定义 Schema
export const loginSchema = z.object({
  username: z.string().min(1, "用户名不能为空"),
  password: z.string().min(1, "密码不能为空"),
});

// 在路由中使用
loginRoutes.post(
  "/auth/login",
  validator("json", loginSchema), // ✅ 自动验证 + 自动解密（如有加密）
  async (c) => {
    const { username, password } = (c.req as any).valid("json");
    // username 和 password 已经是解密后且类型安全的数据
  }
);
```

## 响应与加密

- 成功响应统一使用 `c.sendJson(data, message)`。
- 如需加密，返回的数据对象带上 `isSafeStorage: true`，加密密钥来自 `env.appSecret`。

## 错误处理规范

- 业务异常统一抛 `AppError`（如 `AppError.unauthorized("Token 无效")`）。
- 禁止手写 `c.json({ success: false ... })`。全局 `errorHandler` 负责格式化错误响应并隐藏敏感信息。
- **状态码选择原则**：
  - `400 Bad Request`：请求参数错误（如登录失败、用户名不存在、密码错误）
  - `401 Unauthorized`：已登录用户但 token 无效或过期（会触发前端自动登出）
  - `403 Forbidden`：权限不足
  - `404 Not Found`：资源不存在
  - `500 Internal Server Error`：服务器内部错误

## 配置约定

- 所有环境配置读取自 `src/config/env.ts`，CORS 配置在 `src/config/cors.ts`。
- 禁止散用 `process.env`；使用 `env.*`。

## 单元测试与覆盖率

- 测试框架：Vitest。运行：`pnpm test` / `pnpm test:run` / `pnpm coverage`。
- 覆盖率聚焦 `src/services/**/*.ts`，阈值：lines/statements 90%、functions 90%、branches 80。
- Mock 依赖：使用 `vi.mock` / `MockedFunction<typeof fn>` 隔离外部依赖（如 `userData`, `tokenManager`）。

## 路由示例（正确用法）

```ts
loginRoutes.post("/auth/login", validator("json", loginSchema), async (c) => {
  // 获取已验证且已解密的数据
  const validData = (c.req as any).valid("json");
  const { username, password } = validData as LoginSchema;

  // 调用业务服务
  const res = await c.services.auth.login(username, password);

  // 返回响应（自动加密，如果 res 包含 isSafeStorage: true）
  return c.sendJson(res, "登录成功");
});
```

**说明**:

- `validator` 会自动解密请求数据（如果有 `isSafeStorage: true`）
- `c.sendJson` 会自动加密响应数据（如果有 `isSafeStorage: true`）
- 详见 [加密传输架构文档](./ENCRYPTION.md)

## 错误示例（请避免）

- 在路由中直接查库/鉴权（应放到 service）。
- 在路由中直接 `c.json` 返回错误（应抛 `AppError`）。
- 直接读取 `process.env`（应使用 `env.*`）。
