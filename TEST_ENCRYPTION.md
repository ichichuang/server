# 加密传输测试指南

## 快速测试

### 方式 1: 使用前端示例页面（推荐）

访问前端示例页面查看完整的加密传输演示：

```
http://localhost:5173/example/http/basic
```

页面包含：

- ✅ POST 请求对比（普通传输 vs 加密传输）
- ✅ PUT 请求对比（普通传输 vs 加密传输）
- ✅ 实时查看加密数据（Network 标签）
- ✅ 详细使用说明

### 方式 2: 手动测试接口

### 1. 测试登录接口（加密）

**前端调用**:

```typescript
// ccd/src/views/login/indexs.vue
await login({
  username: "admin",
  password: "123456",
  isSafeStorage: true, // ✅ 启用加密
});
```

**预期结果**:

- ✅ 请求发送: `{ isSafeStorage: true, username: "U2FsdGVkX1...", password: "U2FsdGVkX1..." }`
- ✅ 后端接收: 自动解密为 `{ username: "admin", password: "123456" }`
- ✅ 后端响应: 加密的 token 和 userInfo
- ✅ 前端接收: 自动解密后的数据

### 2. 测试 POST 接口（加密）

**前端调用**:

```typescript
// 在浏览器控制台测试
import { testPost } from "@/api/modules/test";

// 测试 1: 不加密
await testPost({ name: "test without encryption" });

// 测试 2: 加密
await testPost({
  name: "test with encryption",
  isSafeStorage: true,
});
```

**预期结果**:

- ✅ 测试 1: 正常传输，数据不加密
- ✅ 测试 2: 数据加密传输，自动解密

### 3. 查看网络请求

**浏览器开发者工具**:

1. 打开 Chrome/Firefox 开发者工具（F12）
2. 切换到 **Network** 标签
3. 发送加密请求
4. 查看请求详情：
   - **Payload**: 加密后的数据（Base64 字符串，以 `U2FsdGVkX1` 开头）
   - **Response**: 响应数据（如果返回加密，同样是 Base64 字符串）

**加密请求示例**:

```json
{
  "isSafeStorage": true,
  "name": "U2FsdGVkX19XlJGAgMjEMVBjjNgOAf6Hj0waD3EFxoC..."
}
```

**解密后的实际数据**:

```json
{
  "name": "test with encryption"
}
```

## 所有支持加密的接口

### ✅ 已支持加密解密的接口

| 接口      | 方法 | 路径          | 说明                    |
| --------- | ---- | ------------- | ----------------------- |
| 登录      | POST | `/auth/login` | 加密 username、password |
| 测试 POST | POST | `/test/post`  | 加密 name 字段          |
| 测试 PUT  | PUT  | `/test/put`   | 加密 name 字段          |

### 添加新接口支持

**步骤 1**: 定义 Schema

```typescript
// server/src/validators/schemas/newSchemas.ts
import { z } from "zod";

export const newSchema = z.object({
  field1: z.string(),
  field2: z.number(),
});

export type NewSchema = z.infer<typeof newSchema>;
```

**步骤 2**: 在路由中使用 validator

```typescript
// server/src/api/new/endpoint.ts
import { validator } from "../../middleware/validator.js";
import {
  newSchema,
  type NewSchema,
} from "../../validators/schemas/newSchemas.js";

newRoutes.post(
  "/new/endpoint",
  validator("json", newSchema), // ✅ 自动支持加密解密
  async (c) => {
    const validData = (c.req as any).valid("json");
    const data = validData as NewSchema;

    // 处理业务逻辑
    return c.json({
      success: true,
      data: { ...data },
    });
  }
);
```

**步骤 3**: 前端调用

```typescript
// ccd/src/api/modules/new.ts
import type { WithSafeStorage } from "@/utils/modules/http/interceptors";

export const callNewEndpoint = (
  data: WithSafeStorage<{ field1: string; field2: number }>
) => post("/new/endpoint", data);

// 使用
await callNewEndpoint({
  field1: "value",
  field2: 123,
  isSafeStorage: true, // ✅ 启用加密
});
```

## 测试清单

- [ ] 登录接口加密测试
- [ ] 登录接口不加密测试（移除 `isSafeStorage`）
- [ ] 测试 POST 接口加密
- [ ] 测试 PUT 接口加密
- [ ] 查看网络请求中的加密数据
- [ ] 验证前端自动解密响应
- [ ] 访问前端示例页面 `/example/http/basic`
- [ ] 对比普通传输和加密传输的差异

## 常见问题

### Q1: 如何判断数据是否被加密？

**A**: 查看网络请求，加密后的字段值为 Base64 字符串（以 `U2FsdGVkX1` 开头）

### Q2: 为什么有些接口不支持加密？

**A**: 只有使用 `validator("json", schema)` 的接口才支持自动解密。不使用 validator 的接口需要手动处理解密。

### Q3: 如何关闭某个请求的加密？

**A**: 移除或设置 `isSafeStorage: false` 即可

### Q4: 响应数据如何加密？

**A**: 在返回数据中添加 `isSafeStorage: true`，使用 `c.sendJson()` 会自动加密

```typescript
return c.sendJson(
  {
    token: 'xxx',
    userInfo: { ... },
    isSafeStorage: true, // ✅ 响应也加密
  },
  "成功"
)
```

### Q5: 数据加密后体积会变大吗？

**A**: 会略微增大（Base64 编码），但使用了 LZ 压缩，实际增长有限

## 性能考虑

1. **选择性加密**: 仅对敏感数据使用 `isSafeStorage: true`
2. **批量操作**: 加密整个对象，而不是单个字段多次加密
3. **缓存策略**: 加密后的数据可以缓存（前端）

## 前端示例页面

访问 `http://localhost:5173/example/http/basic` 查看完整的加密传输演示。

页面提供：

1. **基础 HTTP 请求**: GET、DELETE 等不需要加密的请求
2. **数据加密传输**: POST、PUT 请求的普通传输和加密传输对比
3. **视觉对比**:
   - 普通请求：灰色标签
   - 加密请求：蓝色边框 + 🔐 标签
4. **使用说明**: 详细的加密传输使用指南

**推荐测试流程**:

1. 访问示例页面
2. 先发送普通请求，查看 Network
3. 再发送加密请求，对比 Payload 差异
4. 查看响应数据（已自动解密）

---

**测试完成后**: 确保所有测试用例通过，加密解密工作正常！  
**相关文档**: [架构说明](./ENCRYPTION.md) | [开发指南](./DEVELOPER_GUIDE.md) | [主文档](./README.md)
