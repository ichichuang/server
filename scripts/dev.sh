#!/bin/bash

# 开发服务器启动脚本
echo "🚀 启动 ccd-server 开发服务器..."

# 检查端口 3003 是否被占用
if lsof -Pi :3003 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 3003 已被占用，正在尝试关闭..."
    lsof -ti:3003 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# 启动开发服务器
echo "📦 安装依赖..."
npm install

echo "🔥 启动开发服务器..."
npm run dev 