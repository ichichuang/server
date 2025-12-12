# 快速参考 - 数据加密传输

> 本文档提供加密传输功能的快速参考，适合快速查阅。详细说明请查看 [ENCRYPTION.md](./ENCRYPTION.md)

## 🚀 一分钟上手

### 前端启用加密

```typescript
// 只需添加 isSafeStorage: true
await login({
  username: "admin",
  password: "123456",
  isSafeStorage: true, // ✅ 就这么简单！
});
```

### 后端支持加密

```typescript
// 使用 validator 中间件即可
loginRoutes.post(
  "/auth/login",
  validator("json", loginSchema), // ✅ 自动支持加密解密
  async (c) => {
    const { username, password } = (c.req as any).valid("json");
    // 数据已自动解密，直接使用
  }
);
```

## 📋 核心概念

| 概念                     | 说明                                         |
| ------------------------ | -------------------------------------------- |
| **isSafeStorage**        | 加密标识，设为 `true` 启用加密传输           |
| **processRequestData**   | 加密/解密请求数据的核心函数                  |
| **processResponseData**  | 加密响应数据的核心函数                       |
| **validator**            | 后端验证中间件（集成自动解密）               |
| **WithSafeStorage\<T\>** | TypeScript 类型，支持可选 isSafeStorage 字段 |

## 🔄 数据流

```
前端                     后端
-----                   -----
明文数据
  ↓ (加密)
加密数据 ─────────────→ 加密数据
                          ↓ (解密)
                        明文数据
                          ↓ (处理)
                        响应数据
                          ↓ (加密)
加密响应 ←───────────── 加密响应
  ↓ (解密)
明文响应
```

## 📁 关键文件

### 前端 (3 个核心文件)

```
ccd/src/utils/modules/http/interceptors.ts    ← 请求加密 + 响应解密
ccd/src/utils/modules/safeStorage/safeStorage.ts ← 加密核心实现
ccd/src/api/modules/*.ts                       ← API 定义（使用 WithSafeStorage）
```

### 后端 (4 个核心文件)

```
server/src/middleware/validator.ts            ← 验证 + 请求解密
server/src/middleware/responseHandler.ts      ← 响应处理 + 响应加密
server/src/libs/requestDecrypt.ts             ← 请求解密函数
server/src/libs/responseEncrypt.ts            ← 响应加密函数
```

## ⚡ 快速命令

### 查看加密数据

```bash
# 浏览器开发者工具
F12 → Network → 选择请求 → Payload
# 加密数据以 U2FsdGVkX1 开头
```

### 测试加密功能

```bash
# 访问前端示例页面
http://localhost:5173/example/http/basic
```

### 测试接口

```bash
# POST 加密测试
curl -X POST http://localhost:3000/test/post \
  -H "Content-Type: application/json" \
  -d '{"isSafeStorage":true,"name":"U2FsdGVkX1..."}'

# 登录加密测试
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"isSafeStorage":true,"username":"U2FsdGVkX1...","password":"U2FsdGVkX1..."}'
```

## 🎯 使用场景

### 需要加密的场景

- ✅ 用户登录（username、password）
- ✅ 用户注册（密码、手机号、身份证等）
- ✅ 支付信息（银行卡、支付密码等）
- ✅ 个人隐私信息（身份证、地址等）
- ✅ 敏感业务数据

### 不需要加密的场景

- ❌ 公开数据（文章列表、商品列表等）
- ❌ 查询参数（分页、排序等）
- ❌ 非敏感配置（主题设置、语言设置等）
- ❌ GET 请求（不支持加密）

## 🔍 调试技巧

### 1. 确认数据是否加密

```typescript
// 查看网络请求
// 加密: { "isSafeStorage": true, "username": "U2FsdGVkX1..." }
// 未加密: { "username": "admin" }
```

### 2. 验证密钥一致性

```typescript
// 前端
console.log(env.appSecret);

// 后端
console.log(env.appSecret);

// 必须相同！
```

### 3. 测试加密解密

```typescript
// 前端控制台
import {
  encryptAndCompressSync,
  decompressAndDecryptSync,
} from "@/utils/modules/safeStorage";

const original = { test: "data" };
const encrypted = encryptAndCompressSync(original);
console.log("加密:", encrypted);

const decrypted = decompressAndDecryptSync(encrypted);
console.log("解密:", decrypted);
// 应该等于 { test: 'data' }
```

## ⚠️ 常见错误

### 错误 1: 解密失败

```
请求数据解密失败: 解密字段 username 失败
```

**原因**: 前后端密钥不一致

**解决**: 检查 `env.appSecret` 配置

### 错误 2: 验证失败

```
ERR_VALIDATION: 用户名不能为空
```

**原因**: 数据未正确解密或加密前数据格式错误

**解决**:

- 检查前端数据格式
- 确认加密逻辑正确执行

### 错误 3: c.req.valid() 返回 undefined

```
Cannot destructure property 'username' of 'c.req.valid(...)' as it is undefined
```

**原因**: 未正确设置验证后的数据

**解决**: 使用 `(c.req as any).valid("json")` 而不是 `c.req.valid("json")`

## 📚 相关文档

- [完整架构说明](./ENCRYPTION.md)
- [测试指南](./TEST_ENCRYPTION.md)
- [开发指南](./DEVELOPER_GUIDE.md)
- [变更日志](./CHANGELOG_ENCRYPTION.md)
- [主文档](./README.md)

---

**快速参考版本**: 1.0  
**最后更新**: 2025-01
