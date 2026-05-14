# CCD Server

CCD 展示架构配套的轻量 API 服务。当前服务只提供演示用户数据，不包含认证、数据库、加密传输或复杂业务层。

## 技术栈

- Hono：轻量 HTTP 框架
- TypeScript：类型约束与构建
- Zod + `@hono/zod-validator`：查询参数校验
- `@hono/node-server`：本地 Node 运行入口

## 快速开始

```bash
pnpm install
pnpm dev
```

默认端口：`3003`。

可通过环境变量覆盖端口：

```bash
PORT=3004 pnpm dev
```

## 脚本

```bash
pnpm dev          # 开发模式，监听 src/server.ts
pnpm check        # TypeScript 类型检查
pnpm build        # 构建到 dist
pnpm start        # 运行 dist/server.js
```

## 目录结构

```text
src/
  index.ts        # Hono app、全局中间件、路由挂载
  server.ts       # Node server 启动入口
  routes/
    users.ts      # 用户 mock 数据接口
```

## 架构边界

当前目标是服务 CCD 展示流，因此保持以下约束：

- 数据保存在进程内存中，服务重启后恢复初始 mock 数据。
- 不引入数据库、ORM、认证、权限、缓存或任务队列。
- 不新增服务层抽象，除非接口数量或业务规则明显增长。
- 响应格式保持稳定，方便前端展示页直接接入。

## 全局中间件

`src/index.ts` 中启用：

- `logger()`：输出请求日志
- `cors()`：展示环境允许跨域访问

CORS 当前配置为 `origin: "*"`, 仅适合本地和展示场景。

## 接口

### Health

```http
GET /health
```

响应：

```json
{
  "status": "ok",
  "timestamp": "2026-05-14T00:00:00.000Z"
}
```

### 用户列表

```http
GET /api/v1/users
```

查询参数：

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `page` | number | `1` | 页码，最小为 1 |
| `limit` | number | `12` | 每页数量，最大为 100 |
| `search` | string | - | 按用户名模糊搜索 |
| `gender` | string | - | 按性别过滤 |
| `sortBy` | string | - | 排序字段 |
| `order` | `asc` / `desc` | - | 排序方向 |

响应：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [],
    "total": 0
  }
}
```

### 新增用户

```http
POST /api/v1/users
Content-Type: application/json
```

请求体会直接合并到新用户对象，并自动生成：

- `id`
- `createdAt`

响应：

```json
{
  "code": 200,
  "message": "Created successfully",
  "data": {
    "id": 1710000000000,
    "createdAt": "2026-05-14T00:00:00.000Z"
  }
}
```

### 更新用户

```http
PUT /api/v1/users/:id
Content-Type: application/json
```

响应：

```json
{
  "code": 200,
  "message": "Updated successfully",
  "data": null
}
```

用户不存在时返回：

```json
{
  "code": 404,
  "message": "User not found",
  "data": null
}
```

### 删除用户

```http
DELETE /api/v1/users/:id
```

响应：

```json
{
  "code": 200,
  "message": "Deleted successfully",
  "data": null
}
```

## 数据模型

```ts
type User = {
  id: number;
  name: string;
  gender: string;
  age: number;
  email: string;
  phone: string;
  status: "active" | "inactive";
  createdAt: string;
};
```

## 适用场景

适合：

- CCD 前端展示页
- 表格、分页、搜索、排序、增删改演示
- 本地开发和演示部署

不适合：

- 生产数据服务
- 多实例一致性
- 用户认证和权限控制
- 长期数据持久化

## 变更原则

- 优先保持简单，避免为了展示服务引入重架构。
- 新接口优先放在 `src/routes` 下。
- 如果 mock 数据或校验规则变复杂，再考虑拆分 `mock`、`schema` 或 `service` 文件。
