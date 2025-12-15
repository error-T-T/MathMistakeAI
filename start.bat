@echo off
chcp 65001 >nul
title MathMistakeAI 一键启动脚本
color 0A

echo ========================================
echo      MathMistakeAI 一键启动脚本
echo ========================================
echo.

REM 设置错误处理
setlocal enabledelayedexpansion

REM 颜色定义（Windows CMD）
for /F "tokens=1,2 delims=#" %%a in ('"prompt #$H#$E# & echo on & for %%b in (1) do rem"') do (
  set "DEL=%%a"
)

REM 日志函数
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

call :log_info "检查系统依赖..."

REM 检查Python
python --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('python --version 2^>^&1') do call :log_success "Python 已安装: %%i"
) else (
    python3 --version >nul 2>&1
    if %errorlevel% equ 0 (
        for /f "tokens=*" %%i in ('python3 --version 2^>^&1') do call :log_success "Python3 已安装: %%i"
    ) else (
        call :log_error "Python 未安装，请先安装 Python"
        pause
        exit /b 1
    )
)

REM 检查Node.js
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do call :log_success "Node.js 已安装: %%i"
) else (
    call :log_error "Node.js 未安装，请先安装 Node.js"
    pause
    exit /b 1
)

REM 检查npm
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do call :log_success "npm 已安装: %%i"
) else (
    call :log_error "npm 未安装，请先安装 npm"
    pause
    exit /b 1
)

REM 检查Ollama（可选）
ollama --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('ollama --version') do call :log_success "Ollama 已安装: %%i"
) else (
    call :log_warning "Ollama 未安装，AI功能将使用模拟模式"
)

echo.

REM 清理端口占用
call :log_info "清理端口占用..."
call :kill_port 8000
call :kill_port 8001
call :kill_port 8002
call :kill_port 8003
call :kill_port 8004
call :kill_port 8005
call :kill_port 8006
call :kill_port 8007
call :kill_port 8008
call :kill_port 5173
call :kill_port 5174
call :kill_port 5175
call :kill_port 5176

echo.

REM 安装Python依赖
call :log_info "安装Python依赖..."
if not exist "venv" (
    call :log_info "创建Python虚拟环境..."
    python -m venv venv
    if %errorlevel% neq 0 (
        python3 -m venv venv
    )
)

REM 激活虚拟环境
call :log_info "激活Python虚拟环境..."
call venv\Scripts\activate.bat

REM 安装Python包
if exist "requirements.txt" (
    pip install --upgrade pip
    pip install -r requirements.txt
    call :log_success "Python依赖安装完成"
) else (
    call :log_error "requirements.txt 文件不存在"
    pause
    exit /b 1
)

echo.

REM 安装前端依赖
call :log_info "安装前端依赖..."
if exist "frontend" (
    cd frontend
    if exist "package.json" (
        call :log_info "正在安装前端依赖（这可能需要几分钟）..."
        npm install
        call :log_success "前端依赖安装完成"
    ) else (
        call :log_error "frontend/package.json 文件不存在"
        pause
        exit /b 1
    )
    cd ..
) else (
    call :log_error "frontend 目录不存在"
    pause
    exit /b 1
)

echo.

REM 启动后端服务
call :log_info "启动后端服务..."
cd backend
start "MathMistakeAI 后端" cmd /k "title MathMistakeAI 后端服务 && venv\Scripts\activate.bat && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 && pause"
cd ..

REM 等待后端启动
call :log_info "等待后端服务启动（5秒）..."
timeout /t 5 /nobreak >nul

REM 检查后端是否启动
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    call :log_success "后端服务启动成功"
) else (
    call :log_warning "后端服务可能启动较慢，请稍后检查"
)

echo.

REM 启动前端服务
call :log_info "启动前端服务..."
cd frontend
start "MathMistakeAI 前端" cmd /k "title MathMistakeAI 前端服务 && npm run dev && pause"
cd ..

REM 等待前端启动
call :log_info "等待前端服务启动（5秒）..."
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo      MathMistakeAI 启动完成！
echo ========================================
echo.
echo 前端地址: http://localhost:5173
echo 后端地址: http://localhost:8000
echo API文档: http://localhost:8000/docs
echo 健康检查: http://localhost:8000/health
echo AI健康检查: http://localhost:8000/api/ai/health
echo.
echo 可用功能:
echo 1. 错题管理页面
echo 2. 错题详情与AI分析
echo 3. 智能题目生成
echo 4. 数据统计可视化
echo.
echo 按任意键打开浏览器访问前端页面...
pause >nul

REM 打开浏览器
start http://localhost:5173

echo.
echo 按任意键停止所有服务并退出...
pause >nul

REM 清理进程
call :log_info "正在停止服务..."
taskkill /FI "WINDOWTITLE eq MathMistakeAI 后端*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq MathMistakeAI 前端*" /F >nul 2>&1
call :kill_port 8000
call :kill_port 5173

call :log_success "服务已停止"
pause
exit /b 0

REM ========================================
REM 函数定义
REM ========================================

:log_info
echo [INFO] %~1
exit /b 0

:log_success
echo [SUCCESS] %~1
exit /b 0

:log_warning
echo [WARNING] %~1
exit /b 0

:log_error
echo [ERROR] %~1
exit /b 0

:kill_port
REM 杀死占用指定端口的进程
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%1" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%p >nul 2>&1
    if !errorlevel! equ 0 (
        call :log_info "已清理端口 %1 的进程 %%p"
    )
)
exit /b 0