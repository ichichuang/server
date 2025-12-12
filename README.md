# CCD Server (Hono + TypeScript)

轻量后端服务，提供加密传输、统一验证/错误处理、依赖注入的业务分层，并配套单元测试与覆盖率门槛。

## 📚 文档导航

> 💡 不知道看哪个文档？查看 [文档索引](./DOCS_INDEX.md) 获取详细指引

### 核心文档

- **[README](./README.md)** - 项目概览和快速开始（本文档）
- **[开发指南](./DEVELOPER_GUIDE.md)** - 架构、分层、验证、错误处理等开发约定
- **[快速参考](./QUICK_REFERENCE.md)** - 加密传输快速参考卡片

### 加密传输相关

- **[加密传输架构](./ENCRYPTION.md)** - 完整的数据加密传输机制说明
- **[加密传输测试](./TEST_ENCRYPTION.md)** - 加密功能测试指南和示例
- **[加密功能变更日志](./CHANGELOG_ENCRYPTION.md)** - 加密系统的实现细节和变更记录

### 其他

- **[文档索引](./DOCS_INDEX.md)** - 所有文档的概览和使用指南

## 快速开始

```bash
pnpm install
pnpm dev          # 本地开发
pnpm build && pnpm start
```

## 主要能力

- **分层架构**：薄路由、厚服务（`src/services`），通用工具在 `src/libs`，配置集中 `src/config`。
- **依赖注入**：`servicesMiddleware` 注入 `c.services`，`responseHandler` 注入 `c.sendJson`。
- **请求验证**：Zod + `validator`，`c.req.valid()` 获取类型安全数据，自动支持加密解密。
- **统一错误**：`AppError` + 全局 `errorHandler`，隐藏敏感信息。
- **🔐 加密传输**：`safeStorage` 支持 `isSafeStorage` 自动加解密，AES + LZ 压缩；密钥来自 `env.appSecret`。
- **测试与覆盖率**：Vitest，覆盖率阈值聚焦服务层。

## 加密传输快速上手

### 前端调用

```typescript
// 添加 isSafeStorage: true 即可启用加密
await login({
  username: "admin",
  password: "123456",
  isSafeStorage: true, // ✅ 自动加密所有字段
});
```

### 后端实现

```typescript
// 使用 validator 自动支持加密解密
loginRoutes.post(
  "/auth/login",
  validator("json", loginSchema), // ✅ 自动解密请求
  async (c) => {
    const { username, password } = (c.req as any).valid("json");
    // 数据已自动解密，可直接使用
    const response = await c.services.auth.login(username, password);
    return c.sendJson(response, "登录成功");
  }
);
```

**详细说明**: 查看 [加密传输架构文档](./ENCRYPTION.md)

## 开发约定

请阅读完整指南：[`DEVELOPER_GUIDE.md`](./DEVELOPER_GUIDE.md)

核心要点：

- 路由只做 HTTP 流程，业务逻辑写在 `services`，通过 `c.services.*` 调用。
- 成功响应用 `c.sendJson(data, message)`；错误抛 `AppError.*`。
- 参数验证用 Zod Schema + `validator("json", schema)`（自动支持加密解密）。
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
- `src/libs`：通用工具
  - `safeStorage.ts` - 加密解密核心实现（AES + LZ 压缩）
  - `requestDecrypt.ts` - 请求数据解密处理
  - `responseEncrypt.ts` - 响应数据加密处理
  - `tokenManager.ts` - JWT 令牌管理
- `src/services`：业务服务（authService 等）
- `src/middleware`：
  - `validator.ts` - 请求验证中间件（集成自动解密）
  - `responseHandler.ts` - 响应处理（集成自动加密）
  - `errorHandler.ts` - 统一错误处理
  - `services.ts` - 依赖注入
- `src/api`：路由入口（auth、test 等）
- `src/validators`：Zod Schema 与错误处理
- `src/types`：全局类型扩展（如 Context augmentation）

## 技术栈

- **框架**: [Hono](https://hono.dev/) - 轻量级 Web 框架
- **语言**: TypeScript
- **验证**: [Zod](https://zod.dev/) - TypeScript-first schema 验证
- **加密**: crypto-js (AES) + lz-string (压缩)
- **测试**: Vitest
- **部署**: Vercel Serverless

## 支持的接口

### 认证接口

- `POST /auth/login` - 用户登录（支持加密传输）
- `GET /auth/userInfo` - 获取用户信息
- `GET /auth/routes` - 获取路由配置

### 测试接口

- `GET /test/get` - GET 测试
- `POST /test/post` - POST 测试（支持加密传输）
- `PUT /test/put` - PUT 测试（支持加密传输）
- `DELETE /test/delete` - DELETE 测试

所有使用 `validator("json", schema)` 的接口都自动支持加密解密。

## 贡献指南

1. 遵循 [开发指南](./DEVELOPER_GUIDE.md) 中的规范
2. 新增接口需要：
   - 定义 Zod Schema (`src/validators/schemas/`)
   - 使用 `validator` 中间件（自动支持加密）
   - 业务逻辑放在 `services` 层
   - 编写单元测试
3. 提交前运行 `pnpm test` 和 `pnpm coverage`

---

**License**: MIT  
**维护者**: Server Team
