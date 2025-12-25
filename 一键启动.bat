@echo off
chcp 65001 >nul
echo ============================================
echo    大学生数学错题智能分析系统 - 一键启动
echo ============================================
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到Python，请先安装Python 3.8+
    pause
    exit /b 1
)

REM 检查npm是否安装
npm --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到npm，请先安装Node.js
    pause
    exit /b 1
)

REM 设置颜色
color 0A

echo [1/4] 正在检查依赖安装...
echo.

REM 检查后端依赖
if exist "Ver1.0.0\backend\requirements.txt" (
    echo    - 检查后端依赖...
    pip show fastapi >nul 2>&1
    if errorlevel 1 (
        echo    - 安装后端依赖中...
        pip install -r Ver1.0.0\backend\requirements.txt
    ) else (
        echo    - 后端依赖已安装
    )
)

REM 检查前端依赖
if exist "Ver1.0.0\frontend\package.json" (
    echo    - 检查前端依赖...
    if not exist "Ver1.0.0\frontend\node_modules" (
        echo    - 安装前端依赖中...
        cd Ver1.0.0\frontend
        npm install
        cd ..\..\
    ) else (
        echo    - 前端依赖已安装
    )
)

echo.
echo [2/4] 正在启动后端服务 (端口 8000)...
echo.

REM 启动后端服务
start "MathMistakeAI Backend" cmd /c "cd /d %~dp0Ver1.0.0\backend && python main.py"

REM 等待后端启动
echo    - 等待后端服务启动...
timeout /t 3 /nobreak >nul

echo.
echo [3/4] 正在启动前端服务 (端口 5173)...
echo.

REM 启动前端服务
start "MathMistakeAI Frontend" cmd /c "cd /d %~dp0Ver1.0.0\frontend && npm run dev"

REM 等待前端启动
echo    - 等待前端服务启动...
timeout /t 5 /nobreak >nul

echo.
echo [4/4] 正在打开浏览器...
echo.
start http://localhost:5173

echo.
echo ============================================
echo    启动完成！
echo ============================================
echo.
echo    后端API: http://localhost:8000
echo    前端界面: http://localhost:5173
echo    API文档: http://localhost:8000/docs
echo.
echo    请手动检查以下功能：
echo    1. 页面是否正常加载
echo    2. 错题导入功能是否正常
echo    3. AI分析功能是否正常
echo    4. 试卷生成功能是否正常
echo.
echo    按任意键退出...
pause >nul
