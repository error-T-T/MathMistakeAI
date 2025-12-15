@echo off
chcp 65001 >nul
title MathMistakeAI 一键启动器
color 0A

echo ========================================
echo      MathMistakeAI 一键启动器
echo ========================================
echo.
echo 作者: Rookie (error-T-T) & 艾可希雅
echo GitHub: error-T-T
echo 邮箱: RookieT@e.gzhu.edu.cn
echo.
echo [信息] 双击此文件即可启动MathMistakeAI全栈应用
echo [信息] 服务启动后会自动打开浏览器
echo [信息] 按Ctrl+C可停止所有服务并自动清理端口
echo.

REM 检查Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] Python未安装或不在PATH中
    echo 请先安装Python 3.8+
    pause
    exit /b 1
)

echo [信息] 正在启动服务，请稍候...
echo.

REM 运行启动器
python launcher.py

if errorlevel 1 (
    echo.
    echo [错误] 启动失败
    echo 您可以尝试:
    echo 1. 检查Python和Node.js是否安装
    echo 2. 运行 start.bat 使用传统启动方式
    echo 3. 查看上面的错误信息
    pause
    exit /b 1
)

echo.
echo [信息] MathMistakeAI已关闭，端口已自动清理
pause