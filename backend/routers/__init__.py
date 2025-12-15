"""
路由器模块
作者: Rookie (error-T-T) & 艾可希雅
GitHub ID: error-T-T
学校邮箱: RookieT@e.gzhu.edu.cn
"""

from .mistakes import router as mistakes_router
from .imports import router as imports_router
from .ai import router as ai_router

__all__ = ["mistakes_router", "imports_router", "ai_router"]