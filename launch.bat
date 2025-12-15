@echo off
chcp 65001 >nul
title MathMistakeAI 高级启动器
color 0A

echo ========================================
echo      MathMistakeAI 高级启动器
echo ========================================
echo.
echo 作者: Rookie (error-T-T) & 艾可希雅
echo GitHub: error-T-T
echo 邮箱: RookieT@e.gzhu.edu.cn
echo.

REM 检查Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] Python未安装或不在PATH中
    echo 请先安装Python 3.8+
    pause
    exit /b 1
)

REM 运行启动器
echo [信息] 正在启动MathMistakeAI...
echo [信息] 按Ctrl+C停止服务并退出
echo.

REM 运行Python启动器
python launcher.py

if errorlevel 1 (
    echo.
    echo [错误] 启动失败，请检查错误信息
    pause
    exit /b 1
)

echo.
echo [信息] MathMistakeAI已关闭
pause