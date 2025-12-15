"""
MathMistakeAI 后端主应用
作者: Rookie (error-T-T) & 艾可希雅
GitHub ID: error-T-T
学校邮箱: RookieT@e.gzhu.edu.cn
"""

import sys
import os

# 添加当前目录到Python路径，确保可以导入本地模块
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
# 添加父目录（项目根目录）到Python路径，确保可以导入backend模块
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import uvicorn
from dotenv import load_dotenv

def safe_print(text: str):
    """安全打印函数，处理Windows控制台编码问题"""
    try:
        print(text)
    except UnicodeEncodeError:
        # 在Windows GBK编码控制台中，尝试使用替换或直接写入
        try:
            # 尝试使用UTF-8编码写入
            sys.stdout.buffer.write(text.encode('utf-8'))
            sys.stdout.buffer.write(b'\n')
            sys.stdout.buffer.flush()
        except:
            # 最后回退：移除非ASCII字符
            cleaned = ''.join(c if ord(c) < 128 else '?' for c in text)
            print(cleaned)

# 导入自定义中间件
from middleware.logging_middleware import LoggingMiddleware

# 导入路由
try:
    from routers import mistakes, ai, imports
except ImportError:
    # 如果直接导入失败，尝试相对导入
    from .routers import mistakes, ai, imports

# 加载环境变量
load_dotenv(".env")

# 生命周期管理
@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时
    safe_print("🚀 MathMistakeAI 后端服务启动中...")
    safe_print(f"📊 使用AI模型: {os.getenv('OLLAMA_MODEL', 'qwen2.5:7b-instruct')}")

    # 初始化数据目录
    os.makedirs("data", exist_ok=True)
    os.makedirs("sample_data", exist_ok=True)
    os.makedirs("logs", exist_ok=True)

    yield
    # 关闭时
    safe_print("👋 MathMistakeAI 后端服务关闭")

# 创建FastAPI应用
app = FastAPI(
    title="MathMistakeAI API",
    description="大学生数学错题智能分析系统",
    version="1.0.0",
    lifespan=lifespan,
    redirect_slashes=False  # 禁用自动重定向，避免307循环
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 配置请求日志记录中间件
app.add_middleware(LoggingMiddleware)

# 注册路由
app.include_router(mistakes.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(imports.router, prefix="/api")

# 健康检查端点
@app.get("/")
async def root():
    """根端点，返回服务状态"""
    return {
        "service": "MathMistakeAI",
        "version": "1.0.0",
        "status": "running",
        "developer": "Rookie (error-T-T) & 艾可希雅",
        "github": "error-T-T",
        "email": "RookieT@e.gzhu.edu.cn",
        "endpoints": {
            "api_docs": "/docs",
            "health_check": "/health",
            "mistakes": "/api/mistakes",
            "ai_analysis": "/api/ai",
            "data_import": "/api/import"
        }
    }

@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {"status": "healthy", "service": "MathMistakeAI"}

@app.get("/api/version")
async def get_version():
    """获取API版本信息"""
    return {
        "name": "MathMistakeAI API",
        "version": "1.0.0",
        "description": "大学生数学错题智能分析系统",
        "features": [
            "错题数据管理",
            "AI智能分析",
            "知识漏洞识别",
            "练习题生成"
        ]
    }

# 主函数
if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    safe_print(f"🌐 服务器启动于: http://{host}:{port}")
    safe_print(f"📚 API文档: http://{host}:{port}/docs")
    safe_print(f"📊 健康检查: http://{host}:{port}/health")
    uvicorn.run(app, host=host, port=port)