#!/bin/bash

# MathMistakeAI 一键启动脚本
# 作者: Rookie (error-T-T) & 艾可希雅
# GitHub ID: error-T-T
# 学校邮箱: RookieT@e.gzhu.edu.cn

set -e  # 遇到错误时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查并杀死占用端口的进程
kill_port() {
    local port=$1
    local service=$2

    if command -v netstat &> /dev/null; then
        # Windows 系统
        local pid=$(netstat -ano | grep ":$port" | grep LISTENING | awk '{print $5}' | head -1)
        if [ ! -z "$pid" ]; then
            log_warning "发现端口 $port 被进程 $pid 占用，正在杀死..."
            taskkill //F //PID $pid > /dev/null 2>&1 && log_success "已杀死进程 $pid" || log_warning "无法杀死进程 $pid"
        fi
    elif command -v lsof &> /dev/null; then
        # Linux/Mac 系统
        local pid=$(lsof -ti:$port)
        if [ ! -z "$pid" ]; then
            log_warning "发现端口 $port 被进程 $pid 占用，正在杀死..."
            kill -9 $pid > /dev/null 2>&1 && log_success "已杀死进程 $pid" || log_warning "无法杀死进程 $pid"
        fi
    fi
}

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."

    # 检查Python
    if command -v python3 &> /dev/null; then
        log_success "Python3 已安装: $(python3 --version 2>&1)"
    elif command -v python &> /dev/null; then
        log_success "Python 已安装: $(python --version 2>&1)"
    else
        log_error "Python 未安装，请先安装 Python"
        exit 1
    fi

    # 检查Node.js
    if command -v node &> /dev/null; then
        log_success "Node.js 已安装: $(node --version)"
    else
        log_error "Node.js 未安装，请先安装 Node.js"
        exit 1
    fi

    # 检查npm
    if command -v npm &> /dev/null; then
        log_success "npm 已安装: $(npm --version)"
    else
        log_error "npm 未安装，请先安装 npm"
        exit 1
    fi

    # 检查Ollama（可选）
    if command -v ollama &> /dev/null; then
        log_success "Ollama 已安装: $(ollama --version)"
    else
        log_warning "Ollama 未安装，AI功能将使用模拟模式"
    fi
}

# 安装Python依赖
install_python_deps() {
    log_info "安装Python依赖..."

    # 检查虚拟环境
    if [ ! -d "venv" ]; then
        log_info "创建Python虚拟环境..."
        python -m venv venv || python3 -m venv venv
    fi

    # 激活虚拟环境
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        source venv/Scripts/activate
    else
        source venv/bin/activate
    fi

    # 安装依赖
    if [ -f "requirements.txt" ]; then
        pip install --upgrade pip
        pip install -r requirements.txt
        log_success "Python依赖安装完成"
    else
        log_error "requirements.txt 文件不存在"
        exit 1
    fi
}

# 安装前端依赖
install_frontend_deps() {
    log_info "安装前端依赖..."

    if [ -d "frontend" ]; then
        cd frontend
        if [ -f "package.json" ]; then
            npm install
            log_success "前端依赖安装完成"
        else
            log_error "frontend/package.json 文件不存在"
            exit 1
        fi
        cd ..
    else
        log_error "frontend 目录不存在"
        exit 1
    fi
}

# 启动后端服务
start_backend() {
    log_info "启动后端服务..."

    # 清理可能占用的端口
    kill_port 8000 "后端"
    kill_port 8001 "后端"
    kill_port 8002 "后端"
    kill_port 8003 "后端"
    kill_port 8004 "后端"
    kill_port 8005 "后端"
    kill_port 8006 "后端"
    kill_port 8007 "后端"
    kill_port 8008 "后端"

    # 激活虚拟环境
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        source venv/Scripts/activate
    else
        source venv/bin/activate
    fi

    # 启动后端服务（使用端口8000）
    cd backend
    log_info "后端服务启动在: http://localhost:8000"
    log_info "API文档: http://localhost:8000/docs"
    log_info "按 Ctrl+C 停止后端服务"

    # 在后台启动服务
    python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    cd ..

    # 等待后端启动
    sleep 3
    if curl -s http://localhost:8000/health > /dev/null; then
        log_success "后端服务启动成功"
    else
        log_error "后端服务启动失败"
        exit 1
    fi
}

# 启动前端服务
start_frontend() {
    log_info "启动前端服务..."

    # 清理可能占用的端口
    kill_port 5173 "前端"
    kill_port 5174 "前端"
    kill_port 5175 "前端"
    kill_port 5176 "前端"

    cd frontend
    log_info "前端服务启动在: http://localhost:5173"
    log_info "按 Ctrl+C 停止前端服务"

    # 在后台启动服务
    npm run dev &
    FRONTEND_PID=$!
    cd ..

    # 等待前端启动
    sleep 5
    if curl -s http://localhost:5173 > /dev/null; then
        log_success "前端服务启动成功"
    else
        log_warning "前端服务可能启动较慢，请稍后访问"
    fi
}

# 显示启动信息
show_startup_info() {
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}      MathMistakeAI 启动完成！      ${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "${BLUE}前端地址:${NC} http://localhost:5173"
    echo -e "${BLUE}后端地址:${NC} http://localhost:8000"
    echo -e "${BLUE}API文档:${NC} http://localhost:8000/docs"
    echo -e "${BLUE}健康检查:${NC} http://localhost:8000/health"
    echo -e "${BLUE}AI健康检查:${NC} http://localhost:8000/api/ai/health"
    echo -e "\n${YELLOW}可用功能:${NC}"
    echo -e "1. 错题管理页面"
    echo -e "2. 错题详情与AI分析"
    echo -e "3. 智能题目生成"
    echo -e "4. 数据统计可视化"
    echo -e "\n${YELLOW}按 Ctrl+C 停止所有服务${NC}"
    echo -e "${GREEN}========================================${NC}\n"
}

# 清理函数
cleanup() {
    log_info "正在停止服务..."

    # 杀死后端进程
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi

    # 杀死前端进程
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi

    # 清理可能遗留的进程
    kill_port 8000 "后端"
    kill_port 5173 "前端"

    log_success "服务已停止"
    exit 0
}

# 主函数
main() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}   MathMistakeAI 一键启动脚本   ${NC}"
    echo -e "${GREEN}========================================${NC}"

    # 设置退出时的清理函数
    trap cleanup INT TERM EXIT

    # 检查依赖
    check_dependencies

    # 安装依赖
    install_python_deps
    install_frontend_deps

    # 启动服务
    start_backend
    start_frontend

    # 显示启动信息
    show_startup_info

    # 等待用户中断
    wait
}

# 运行主函数
main "$@"