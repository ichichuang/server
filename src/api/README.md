# API 接口文档

本文档描述了后端 API 接口的分类和使用说明。

## 目录结构

```
src/api/
├── auth/          # 认证相关接口
│   ├── login.ts
│   ├── userInfo.ts
│   └── router.ts
├── test/          # 测试接口
│   └── test.ts
├── example/       # 基础 CRUD 示例接口
│   └── example.ts
├── upload/        # 文件上传接口
│   ├── upload.ts  # 单文件/多文件上传
│   └── chunk.ts   # 分片上传
├── download/      # 文件下载接口
│   └── download.ts
└── health/        # 健康检查接口
    └── health.ts
```

## 接口分类说明

### 1. 示例接口 (example/)

提供完整的 CRUD 操作示例，支持数据加密解密。

#### 接口列表

- `GET /api/example/list` - 获取列表（支持分页和搜索）
- `GET /api/example/:id` - 获取详情
- `POST /api/example/create` - 创建（支持加密数据）
- `PUT /api/example/update` - 更新
- `PATCH /api/example/patch/:id` - 部分更新
- `DELETE /api/example/:id` - 删除

#### 使用示例

```typescript
// 创建（支持加密）
POST /api/example/create
{
  "name": "示例名称",
  "description": "描述",
  "isSafeStorage": true  // 可选，启用加密
}

// 获取列表（支持分页）
GET /api/example/list?page=1&pageSize=10&keyword=示例
```

### 2. 文件上传接口 (upload/)

#### 单文件上传

- `POST /api/upload/file` - 上传单个文件

**请求格式**: `multipart/form-data`
- `file`: File 对象

**响应格式**:
```json
{
  "success": true,
  "data": {
    "filename": "原始文件名",
    "savedName": "保存的文件名",
    "size": 文件大小,
    "type": "文件类型",
    "url": "/uploads/文件名",
    "uploadedAt": "上传时间"
  },
  "message": "上传成功"
}
```

#### 多文件上传

- `POST /api/upload/files` - 批量上传文件

**请求格式**: `multipart/form-data`
- `files`: File[] 数组

**响应格式**:
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "filename": "文件名",
        "savedName": "保存的文件名",
        "size": 文件大小,
        "type": "文件类型",
        "url": "/uploads/文件名",
        "uploadedAt": "上传时间"
      }
    ],
    "count": 文件数量
  },
  "message": "批量上传成功"
}
```

### 3. 分片上传接口 (upload/chunk.ts)

支持大文件分片上传、断点续传功能。

#### 接口列表

- `POST /api/upload/check` - 检查已上传的分片
- `POST /api/upload/chunk` - 上传单个分片
- `POST /api/upload/merge` - 合并分片

#### 使用流程

1. **检查已上传分片**
```typescript
POST /api/upload/check
{
  "fileId": "文件ID",
  "fileName": "文件名",
  "fileHash": "文件哈希",
  "totalChunks": 总分片数
}

// 响应
{
  "success": true,
  "data": {
    "uploadedChunks": [0, 1, 2]  // 已上传的分片索引
  }
}
```

2. **上传分片**
```typescript
POST /api/upload/chunk
FormData:
  - file: 分片文件
  - fileId: 文件ID
  - fileName: 文件名
  - fileHash: 文件哈希
  - chunkIndex: 分片索引
  - totalChunks: 总分片数
  - chunkSize: 分片大小
  - fileSize: 文件总大小
```

3. **合并分片**
```typescript
POST /api/upload/merge
{
  "fileId": "文件ID",
  "fileName": "文件名",
  "fileHash": "文件哈希",
  "totalChunks": 总分片数
}

// 响应
{
  "success": true,
  "data": {
    "fileId": "文件ID",
    "fileName": "文件名",
    "savedName": "保存的文件名",
    "url": "/uploads/文件名",
    "size": 文件大小,
    "uploadedAt": "上传时间"
  }
}
```

### 4. 文件下载接口 (download/)

使用 `public/file` 目录中的文件提供下载服务。

#### 接口列表

- `GET /api/download/list` - 获取文件列表
- `GET /api/download/file/:filename` - 下载文件
- `GET /api/download/info/:filename` - 获取文件信息（不下载）

#### 使用示例

```typescript
// 获取文件列表
GET /api/download/list

// 下载文件
GET /api/download/file/pngsuc.png
GET /api/download/file/未命名.et

// 获取文件信息
GET /api/download/info/pngsuc.png
```

**响应头设置**:
- `Content-Type`: `application/octet-stream`
- `Content-Disposition`: `attachment; filename="文件名"`
- `Content-Length`: 文件大小

### 5. 健康检查接口 (health/)

用于连接状态监控和健康检查。

#### 接口列表

- `GET /api/health` - 健康检查（返回详细信息）
- `HEAD /api/health` - 健康检查（用于连接管理器）

#### 响应格式

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

## 通用特性

### 1. 统一响应格式

所有接口使用统一的响应格式：

```json
{
  "success": true,
  "data": {...},
  "message": "操作成功"
}
```

### 2. 数据加密支持

请求和响应数据支持 `isSafeStorage: true` 标记进行加密：

**请求加密**:
```json
{
  "name": "加密后的值",
  "isSafeStorage": true
}
```

**响应加密**:
```json
{
  "success": true,
  "data": {
    "name": "加密后的值",
    "isSafeStorage": true
  }
}
```

### 3. 错误处理

所有接口使用 `AppError` 进行错误处理：

- `400 Bad Request` - 请求参数错误
- `401 Unauthorized` - 未授权
- `403 Forbidden` - 禁止访问
- `404 Not Found` - 资源不存在
- `500 Internal Server Error` - 服务器内部错误

### 4. 认证支持

需要认证的接口会自动从请求头读取 `Authorization: Bearer {token}`。

## 文件存储位置

- **上传文件**: `public/uploads/`
- **分片文件**: `public/chunks/{fileId}/`
- **下载文件**: `public/file/`（使用现有文件）

## 注意事项

1. 文件上传会自动创建必要的目录
2. 分片上传完成后会自动清理临时分片文件
3. 文件下载接口包含路径遍历攻击防护
4. 所有接口都支持 CORS 跨域请求


