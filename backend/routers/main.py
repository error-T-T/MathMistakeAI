"""
主路由集成
将所有路由集成到一个应用中

作者: Rookie (error-T-T) & 艾可希雅
GitHub ID: error-T-T
学校邮箱: RookieT@e.gzhu.edu.cn
"""

from fastapi import APIRouter
from . import mistakes_router, imports_router, ai_router

# 创建主路由器
main_router = APIRouter()

# 包含所有子路由
main_router.include_router(mistakes_router, prefix="/mistakes", tags=["错题管理"])
main_router.include_router(imports_router, prefix="/import", tags=["数据导入"])
main_router.include_router(ai_router, prefix="/ai", tags=["AI分析"])

# 根路由
@main_router.get("/")
async def root():
    """API根路径"""
    return {
        "service": "数学错题管理系统API",
        "version": "1.0.0",
        "description": "提供错题管理、AI分析和数据导入功能",
        "endpoints": {
            "错题管理": "/mistakes",
            "数据导入": "/import",
            "AI分析": "/ai"
        },
        "authors": [
            {
                "name": "Rookie (error-T-T)",
                "github": "https://github.com/error-T-T",
                "email": "RookieT@e.gzhu.edu.cn"
            },
            {
                "name": "艾可希雅",
                "role": "协作开发者"
            }
        ]
    }

# 健康检查
@main_router.get("/health")
async def health_check():
    """API健康检查"""
    return {
        "status": "healthy",
        "service": "MathMistakeAI API",
        "version": "1.0.0"
    }