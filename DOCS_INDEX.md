# 📚 CCD Server 文档索引

## 文档概览

| 文档                                                 | 大小  | 用途               | 适合读者    |
| ---------------------------------------------------- | ----- | ------------------ | ----------- |
| [README.md](./README.md)                             | 4.7KB | 项目概览、快速开始 | 🌟 所有人   |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)           | 5.0KB | 加密传输快速参考   | 🌟 快速查阅 |
| [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)           | 3.5KB | 开发规范和约定     | 👨‍💻 开发者   |
| [ENCRYPTION.md](./ENCRYPTION.md)                     | 15KB  | 加密传输完整架构   | 👨‍💻 开发者   |
| [TEST_ENCRYPTION.md](./TEST_ENCRYPTION.md)           | 5.8KB | 加密功能测试指南   | 🧪 测试人员 |
| [CHANGELOG_ENCRYPTION.md](./CHANGELOG_ENCRYPTION.md) | 7.1KB | 加密功能变更日志   | 📋 维护者   |

## 🎯 按场景选择文档

### 我是新人，想快速了解项目

1. 阅读 [README.md](./README.md) - 了解项目概览
2. 阅读 [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - 了解开发规范
3. 查看 [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - 快速参考

### 我要实现加密传输功能

1. 阅读 [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - 快速上手
2. 阅读 [ENCRYPTION.md](./ENCRYPTION.md) - 深入理解架构
3. 参考 [TEST_ENCRYPTION.md](./TEST_ENCRYPTION.md) - 测试验证

### 我要测试加密功能

1. 阅读 [TEST_ENCRYPTION.md](./TEST_ENCRYPTION.md) - 测试指南
2. 访问前端示例页面 `/example/http/basic`
3. 参考 [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - 调试技巧

### 我要了解实现细节

1. 阅读 [ENCRYPTION.md](./ENCRYPTION.md) - 完整架构
2. 阅读 [CHANGELOG_ENCRYPTION.md](./CHANGELOG_ENCRYPTION.md) - 实现细节
3. 查看源代码注释

### 我遇到了问题

1. 查看 [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - 常见错误
2. 查看 [ENCRYPTION.md](./ENCRYPTION.md) - 故障排查
3. 查看 [TEST_ENCRYPTION.md](./TEST_ENCRYPTION.md) - 测试验证

## 📖 文档内容概要

### README.md

- 项目简介和主要能力
- 快速开始命令
- 加密传输快速上手
- 文档导航
- 目录结构和技术栈
- 支持的接口列表

### QUICK_REFERENCE.md

- 一分钟上手示例
- 核心概念速查表
- 数据流图
- 关键文件列表
- 快速命令
- 常见错误和解决方案

### DEVELOPER_GUIDE.md

- 架构与分层原则
- 请求验证规范
- 响应与加密处理
- 错误处理规范
- 配置约定
- 单元测试与覆盖率
- 路由示例

### ENCRYPTION.md

- 完整的架构说明
- 前后端实现细节
- 使用方式和示例
- 支持的接口列表
- 加密算法说明
- 安全特性
- 完整示例代码
- 核心代码位置
- 密钥配置
- 性能优化建议
- 故障排查指南

### TEST_ENCRYPTION.md

- 前端示例页面使用
- 手动测试步骤
- 网络请求查看方法
- 所有支持加密的接口
- 添加新接口的步骤
- 测试清单
- 常见问题 FAQ

### CHANGELOG_ENCRYPTION.md

- 功能实现历史
- 新增功能列表
- 文档完善记录
- 代码优化记录
- 核心特性说明
- 支持的接口统计
- 测试验证结果
- 技术细节
- 安全建议
- 后续优化方向

## 🔗 文档关系图

```
                    README.md (入口)
                         |
        +----------------+----------------+
        |                |                |
  DEVELOPER_GUIDE   QUICK_REFERENCE   ENCRYPTION
        |                |                |
        |                +-------+--------+
        |                        |
        +----------+-------------+
                   |
            TEST_ENCRYPTION
                   |
          CHANGELOG_ENCRYPTION
```

## 📝 文档维护

### 更新文档时

1. **添加新功能**: 更新 ENCRYPTION.md 和 TEST_ENCRYPTION.md
2. **修改接口**: 更新 ENCRYPTION.md 和 QUICK_REFERENCE.md
3. **优化性能**: 更新 ENCRYPTION.md 性能建议部分
4. **修复 Bug**: 记录到 CHANGELOG_ENCRYPTION.md

### 文档规范

- ✅ 使用清晰的标题层级
- ✅ 添加代码示例
- ✅ 使用表格和列表
- ✅ 添加视觉标识（✅ ❌ 🔐 等）
- ✅ 保持文档同步更新

---

**文档版本**: 1.0  
**最后更新**: 2025-01  
**维护者**: Server Team
