"""
AI分析API路由
作者: Rookie (error-T-T) & 艾可希雅
GitHub ID: error-T-T
学校邮箱: RookieT@e.gzhu.edu.cn
"""

import sys
import os

# 添加父目录到Python路径，确保可以导入本地模块
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from fastapi import APIRouter, HTTPException, Query
from typing import List

# 直接导入（已设置sys.path）
from ai_engine import AIEngine
from data_models import AnalysisRequest, AnalysisResponse, GeneratePracticeRequest

# 初始化路由 - 只定义一次
router = APIRouter(prefix="/ai", tags=["AI分析"])

# 初始化AI引擎
ai_engine = AIEngine()

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_mistake_directly(request: AnalysisRequest):
    """直接分析错题（无需先保存）"""
    try:
        analysis = ai_engine.analyze_mistake(request)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI分析失败: {str(e)}")

@router.post("/generate-practice")
async def generate_practice_questions(request: GeneratePracticeRequest):
    """根据知识漏洞和参数生成练习题"""
    try:
        questions = ai_engine.generate_practice_questions(
            knowledge_gaps=request.knowledge_gaps,
            count=request.count,
            difficulty=request.difficulty,
            similarity_level=request.similarity_level
        )
        return {
            "knowledge_gaps": request.knowledge_gaps,
            "difficulty": request.difficulty,
            "similarity_level": request.similarity_level,
            "count": len(questions),
            "questions": questions
        }
    except Exception as e:
        # 移除错误信息中的emoji字符，避免编码问题
        error_msg = str(e)
        # 移除常见的emoji和特殊字符
        cleaned_error = ''.join(c for c in error_msg if ord(c) < 128)
        if not cleaned_error:
            cleaned_error = "生成练习题时发生未知错误"
        raise HTTPException(status_code=500, detail=f"生成练习题失败: {cleaned_error}")

@router.get("/explain/{concept}")
async def explain_concept(concept: str):
    """解释数学概念"""
    try:
        explanation = ai_engine.explain_concept(concept)
        return {
            "concept": concept,
            "explanation": explanation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"解释概念失败: {str(e)}")

@router.get("/health")
async def ai_health_check():
    """AI引擎健康检查"""
    return ai_engine.health_check()

@router.get("/model-info")
async def get_model_info():
    """获取AI模型信息"""
    return {
        "model": ai_engine.model,
        "base_url": ai_engine.base_url,
        "connected": ai_engine.is_connected,
        "service": "MathMistakeAI AI Engine"
    }