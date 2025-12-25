#!/bin/bash

echo "=== MathMistakeAI 初始化脚本 ==="

# 检查当前目录
if [ ! -d "Ver1.0.0" ]; then
    echo "错误：请在项目根目录执行此脚本"
    exit 1
fi

# 安装后端依赖
echo "\n1. 安装后端依赖..."
cd Ver1.0.0/backend
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "错误：后端依赖安装失败"
    exit 1
fi

# 安装前端依赖
echo "\n2. 安装前端依赖..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "错误：前端依赖安装失败"
    exit 1
fi

# 返回项目根目录
cd ../../

# 启动后端服务器
echo "\n3. 启动后端服务器..."
cd Ver1.0.0/backend
python main.py &
BACKEND_PID=$!
echo "后端服务器已启动，PID: $BACKEND_PID"

# 等待后端服务器启动
sleep 3

# 启动前端服务器
echo "\n4. 启动前端服务器..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "前端服务器已启动，PID: $FRONTEND_PID"

# 等待前端服务器启动
sleep 3

# 执行基础测试
echo "\n5. 执行基础功能测试..."
# 这里可以添加基础测试命令，例如使用curl测试API是否可用
curl -s http://localhost:8000/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ 后端API健康检查通过"
else
    echo "✗ 后端API健康检查失败"
fi

# 显示服务器信息
echo "\n=== 服务器启动完成 ==="
echo "后端API地址: http://localhost:8000"
echo "前端页面地址: http://localhost:5173"
echo "\n按 Ctrl+C 停止所有服务器"

# 等待用户中断
trap "kill $BACKEND_PID $FRONTEND_PID; echo '\n服务器已停止'; exit 0" INT
wait