# 数据加密传输架构说明

本项目实现了前后端完整的数据加密传输机制，通过 `isSafeStorage` 标识来控制是否对数据进行加密。

## 架构概览

```
前端                                    后端
-----                                   -----
请求数据 + isSafeStorage: true
  ↓
[processRequestData] 加密所有字段值
  ↓
发送加密后的请求
  ↓                                     ↓
  ↓                               [validator 中间件]
  ↓                                     ↓
  ↓                          检测到 isSafeStorage: true
  ↓                                     ↓
  ↓                          [processRequestData] 解密所有字段值
  ↓                                     ↓
  ↓                               验证解密后的数据
  ↓                                     ↓
  ↓                               路由处理器处理
  ↓                                     ↓
  ↓                          返回响应 + isSafeStorage: true
  ↓                                     ↓
  ↓                          [processResponseData] 加密所有字段值
  ↓                                     ↓
接收加密后的响应                          ↓
  ↓
[responseHandler] 自动解密
  ↓
应用接收解密后的数据
```

## 前端实现

### 1. 请求加密 (`ccd/src/utils/modules/http/interceptors.ts`)

```typescript
// 在 beforeRequest 拦截器中自动处理
export const processRequestData = <T extends Record<string, any>>(
  data: T
): T => {
  if (data && typeof data === "object" && data.isSafeStorage === true) {
    // 遍历所有字段（除了 isSafeStorage），加密每个字段的值
    // 保持 key 不变，只加密 value
    const encryptedData = {};
    for (const key in data) {
      if (key !== "isSafeStorage") {
        encryptedData[key] = encryptAndCompressSync(data[key]);
      }
    }
    encryptedData.isSafeStorage = true;
    return encryptedData;
  }
  return data;
};
```

### 2. 响应解密 (`ccd/src/utils/modules/http/interceptors.ts`)

```typescript
// 在 responseHandler 中自动处理
if (responseData && responseData.isSafeStorage === true) {
  // 遍历所有字段（除了 isSafeStorage），解密每个字段的值
  const decryptedData = {};
  for (const key in responseData) {
    if (key !== "isSafeStorage" && typeof responseData[key] === "string") {
      decryptedData[key] = decompressAndDecryptSync(responseData[key]);
    }
  }
  return decryptedData;
}
```

### 3. 使用方式

```typescript
// API 定义（支持 isSafeStorage）
export const login = (
  params: WithSafeStorage<{ username: string; password: string }>
) => post<LoginResponse>("/auth/login", params);

// 调用（添加 isSafeStorage: true 即可启用加密）
await login({
  username: "admin",
  password: "123456",
  isSafeStorage: true, // ✅ 自动加密
});
```

## 后端实现

### 1. 请求解密 (`server/src/middleware/validator.ts`)

```typescript
// 集成在 validator 中间件中，自动处理所有使用 validator 的接口
export const validator = (target: "json", schema: z.ZodTypeAny) => {
  if (target === "json") {
    return async (c: Context, next: Next) => {
      const rawBody = await c.req.json();

      // 检测 isSafeStorage: true，自动解密
      let bodyToValidate = rawBody;
      if (rawBody.isSafeStorage === true) {
        bodyToValidate = processRequestData(rawBody); // 解密所有字段值
      }

      // 验证解密后的数据
      const validationResult = schema.safeParse(bodyToValidate);
      // ...
    };
  }
};
```

### 2. 响应加密 (`server/src/libs/responseEncrypt.ts`)

```typescript
// 在 sendJson 方法中自动处理
export const processResponseData = <T>(data: T): T => {
  if (data && typeof data === "object" && data.isSafeStorage === true) {
    // 遍历所有字段（除了 isSafeStorage），加密每个字段的值
    const encryptedData = { isSafeStorage: true };
    for (const key in data) {
      if (key !== "isSafeStorage") {
        encryptedData[key] = encryptAndCompressSync(data[key]);
      }
    }
    return encryptedData;
  }
  return data;
};
```

### 3. 使用方式

```typescript
// ✅ 接口定义（使用 validator 自动支持解密）
loginRoutes.post(
  "/auth/login",
  validator("json", loginSchema), // ✅ 自动解密请求（如果有 isSafeStorage: true）
  async (c) => {
    // 获取已解密的数据
    const validData = (c.req as any).valid("json");
    const { username, password } = validData as LoginSchema;

    // 处理业务逻辑
    const response = await c.services.auth.login(username, password);

    // ✅ 返回加密响应
    return c.sendJson(response, "登录成功"); // 自动加密（如果 response 包含 isSafeStorage: true）
  }
);
```

## 支持的接口

所有使用 `validator("json", schema)` 的接口都自动支持加密解密：

### 1. 认证接口

- ✅ `POST /auth/login` - 登录接口（已支持）
  - 请求：加密 username、password
  - 响应：加密 token、userInfo

### 2. 测试接口

- ✅ `POST /test/post` - 测试 POST（已支持）
- ✅ `PUT /test/put` - 测试 PUT（已支持）

### 3. 添加新接口

只需要两步即可支持加密解密：

**步骤 1: 定义 Schema**

```typescript
// server/src/validators/schemas/yourSchemas.ts
export const yourSchema = z.object({
  field1: z.string(),
  field2: z.number(),
});
```

**步骤 2: 使用 validator**

```typescript
// server/src/api/your/endpoint.ts
import { validator } from "../../middleware/validator.js";
import { yourSchema } from "../../validators/schemas/yourSchemas.js";

yourRoutes.post(
  "/your/endpoint",
  validator("json", yourSchema), // ✅ 自动支持加密解密
  async (c) => {
    const validData = (c.req as any).valid("json");
    // 处理业务逻辑...
  }
);
```

## 加密算法

使用 `crypto-js` 实现 AES 对称加密：

1. **加密流程**: JSON.stringify → LZ 压缩 → AES 加密 → Base64
2. **解密流程**: Base64 → AES 解密 → LZ 解压 → JSON.parse

**核心函数**:

- `encryptAndCompressSync(value)` - 加密并压缩
- `decompressAndDecryptSync(encrypted)` - 解密并解压

## 安全特性

1. ✅ **可选加密**: 通过 `isSafeStorage: true` 控制是否加密
2. ✅ **字段级加密**: 只加密字段的值（value），保持 key 明文
3. ✅ **类型安全**: TypeScript 完整支持
4. ✅ **自动处理**: 无需手动加密解密，完全透明
5. ✅ **通用性**: 对所有使用 `validator` 的接口生效

## 示例

### 前端调用示例

```typescript
// 1. 不加密的普通请求
await testPost({ name: "test" });
// 发送: { name: "test" }
// 接收: { name: "test" }

// 2. 启用加密的请求
await testPost({ name: "test", isSafeStorage: true });
// 发送: { isSafeStorage: true, name: "U2FsdGVkX1..." }
// 接收: { isSafeStorage: true, name: "U2FsdGVkX1..." }
// 自动解密后: { name: "test" }
```

### 后端处理示例

```typescript
// 请求 1: 不加密 { name: "test" }
// validator 接收: { name: "test" }
// 验证: ✅ 通过
// 处理: name = "test"

// 请求 2: 加密 { isSafeStorage: true, name: "U2FsdGVkX1..." }
// validator 检测到 isSafeStorage: true
// 自动解密: { name: "test" }
// 验证: ✅ 通过
// 处理: name = "test"
```

## 开发调试

### 查看加密数据

1. **浏览器开发者工具**:

   - 打开 Network 标签
   - 查看请求的 Payload/Request
   - 加密数据以 `U2FsdGVkX1` 开头（Base64 编码）

2. **前端示例页面**:
   - 访问 `/example/http/basic`
   - 对比普通传输和加密传输的差异
   - 查看网络请求中的加密数据

### 错误处理

如果解密失败，会抛出清晰的错误信息：

```typescript
throw new Error(`请求数据解密失败: 解密字段 ${key} 失败`);
```

- 检查前后端密钥是否一致（`env.appSecret`）
- 检查数据格式是否正确
- 确认加密数据未被篡改

## 注意事项

1. **必须使用 validator**: 只有使用 `validator("json", schema)` 的接口才支持自动解密
2. **字段类型**: 只加密对象的字段值，数组、嵌套对象会被序列化后加密
3. **性能考虑**: 加密解密有一定开销，仅对敏感数据使用 `isSafeStorage: true`
4. **密钥管理**: 前后端使用相同的加密密钥（在 safeStorage 模块中配置）

## 扩展性

要为新的接口添加加密支持：

1. ✅ **前端**: 在 API 调用时添加 `isSafeStorage: true`
2. ✅ **后端**: 使用 `validator("json", schema)` 中间件
3. ✅ **自动**: 其他无需改动，加密解密自动处理

### 快速添加新接口示例

假设要创建一个用户注册接口，支持加密传输：

**步骤 1: 定义 Schema** (`server/src/validators/schemas/authSchemas.ts`)

```typescript
export const registerSchema = z.object({
  username: z.string().min(3, "用户名至少3个字符"),
  password: z.string().min(6, "密码至少6个字符"),
  email: z.string().email("邮箱格式不正确"),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
```

**步骤 2: 实现路由** (`server/src/api/auth/register.ts`)

```typescript
import { validator } from "../../middleware/validator.js";
import {
  registerSchema,
  type RegisterSchema,
} from "../../validators/schemas/authSchemas.js";

registerRoutes.post(
  "/auth/register",
  validator("json", registerSchema), // ✅ 自动支持解密
  async (c) => {
    const { username, password, email } = (c.req as any).valid(
      "json"
    ) as RegisterSchema;
    // 数据已自动解密且验证通过
    const response = await c.services.auth.register(username, password, email);
    return c.sendJson(response, "注册成功");
  }
);
```

**步骤 3: 前端 API** (`ccd/src/api/modules/auth.ts`)

```typescript
import type { WithSafeStorage } from "@/utils/modules/http/interceptors";

export const register = (
  params: WithSafeStorage<{ username: string; password: string; email: string }>
) => post("/auth/register", params);
```

**步骤 4: 前端调用**

```typescript
// 启用加密传输
await register({
  username: "newuser",
  password: "password123",
  email: "user@example.com",
  isSafeStorage: true, // ✅ 自动加密
});
```

完成！新接口已支持加密传输。

## 核心代码位置

### 前端代码

| 文件                                                              | 说明                                         |
| ----------------------------------------------------------------- | -------------------------------------------- |
| `ccd/src/utils/modules/http/interceptors.ts`                      | HTTP 拦截器，包含请求加密和响应解密逻辑      |
| `ccd/src/utils/modules/safeStorage/safeStorage.ts`                | 加密解密核心函数                             |
| `ccd/src/api/modules/auth.ts`                                     | 认证 API 定义（使用 `WithSafeStorage` 类型） |
| `ccd/src/api/modules/test.ts`                                     | 测试 API 定义（使用 `WithSafeStorage` 类型） |
| `ccd/src/views/example/views/example-http/example-http-basic.vue` | 加密传输示例页面                             |

### 后端代码

| 文件                                           | 说明                               |
| ---------------------------------------------- | ---------------------------------- |
| `server/src/libs/safeStorage.ts`               | 加密解密核心函数（与前端相同实现） |
| `server/src/libs/requestDecrypt.ts`            | 请求数据解密处理函数               |
| `server/src/libs/responseEncrypt.ts`           | 响应数据加密处理函数               |
| `server/src/middleware/validator.ts`           | 验证中间件（集成请求解密）         |
| `server/src/middleware/responseHandler.ts`     | 响应处理中间件（集成响应加密）     |
| `server/src/api/auth/login.ts`                 | 登录接口实现                       |
| `server/src/api/test/test.ts`                  | 测试接口实现                       |
| `server/src/validators/schemas/authSchemas.ts` | 认证相关 Schema                    |
| `server/src/validators/schemas/testSchemas.ts` | 测试相关 Schema                    |

## 完整示例

### 前端完整示例

```typescript
// 1. 定义 API（支持加密）
// ccd/src/api/modules/auth.ts
import type { WithSafeStorage } from "@/utils/modules/http/interceptors";

export const login = (
  params: WithSafeStorage<{ username: string; password: string }>
) => post<LoginResponse>("/auth/login", params);

// 2. 在组件中调用
// ccd/src/views/login/indexs.vue
const handleLogin = async (values: { username: string; password: string }) => {
  try {
    const response = await login({
      username: values.username,
      password: values.password,
      isSafeStorage: true, // ✅ 启用加密
    });
    // response 已自动解密
    console.log("登录成功:", response);
  } catch (error) {
    console.error("登录失败:", error);
  }
};
```

### 后端完整示例

```typescript
// 1. 定义 Schema
// server/src/validators/schemas/authSchemas.ts
import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "用户名不能为空"),
  password: z.string().min(1, "密码不能为空"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

// 2. 实现路由
// server/src/api/auth/login.ts
import { Hono } from "hono";
import { validator } from "../../middleware/validator.js";
import {
  loginSchema,
  type LoginSchema,
} from "../../validators/schemas/authSchemas.js";

const loginRoutes = new Hono();

loginRoutes.post(
  "/auth/login",
  validator("json", loginSchema), // ✅ 自动解密请求
  async (c) => {
    // 获取已解密且已验证的数据
    const validData = (c.req as any).valid("json");
    const { username, password } = validData as LoginSchema;

    // 调用业务服务
    const response = await c.services.auth.login(username, password);

    // 返回响应（如果 response 包含 isSafeStorage: true，会自动加密）
    return c.sendJson(response, "登录成功");
  }
);

export { loginRoutes };
```

## 密钥配置

### 前端密钥

```typescript
// ccd/src/utils/modules/safeStorage/safeStorage.ts
const ENCRYPTION_KEY = "your-secret-key"; // 从环境变量或配置文件读取
```

### 后端密钥

```typescript
// server/src/libs/safeStorage.ts
import { env } from "../config/env.js";

const ENCRYPTION_KEY = env.appSecret; // 从环境变量读取
```

**重要**: 确保前后端使用相同的密钥！

## 性能优化建议

1. **选择性加密**:

   - ✅ 敏感数据（密码、身份证等）使用加密
   - ❌ 非敏感数据（用户名、标题等）不需要加密

2. **批量操作**:

   - ✅ 一次加密整个对象
   - ❌ 多次调用 API 加密单个字段

3. **缓存策略**:

   - 加密后的响应数据可以缓存
   - 解密后的数据也可以缓存（注意安全性）

4. **网络优化**:
   - LZ 压缩可以显著减小数据体积
   - 对于大对象，加密后体积可能比原始数据还小（得益于压缩）

## 故障排查

### 1. 解密失败

**症状**: 请求返回 `请求数据解密失败` 错误

**可能原因**:

- 前后端密钥不一致
- 数据在传输过程中被篡改
- 加密数据格式不正确

**解决方案**:

- 检查 `env.appSecret` 配置
- 查看网络请求，确认数据格式
- 确认前端 `encryptAndCompressSync` 和后端 `decompressAndDecryptSync` 使用相同密钥

### 2. 验证失败

**症状**: 请求返回验证错误

**可能原因**:

- 解密后的数据不符合 Schema 定义
- 加密前的数据类型错误

**解决方案**:

- 检查前端发送的数据是否符合 API 定义
- 查看 Schema 定义，确认字段类型和约束

### 3. c.req.valid() 返回 undefined

**症状**: 路由处理器中 `c.req.valid("json")` 返回 `undefined`

**可能原因**:

- 未使用 `validator` 中间件
- 中间件顺序错误

**解决方案**:

- 确保路由使用了 `validator("json", schema)`
- 检查 `(c.req as any).valid("json")` 的调用方式

---

**更新日期**: 2025-01
**维护者**: Server Team  
**相关文档**: [开发指南](./DEVELOPER_GUIDE.md) | [测试指南](./TEST_ENCRYPTION.md)
