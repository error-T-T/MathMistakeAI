"""
错题管理API路由
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

from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional

# 直接导入（已设置sys.path）
from data_models import (
    MistakeCreate, MistakeResponse, MistakeUpdate,
    AnalysisRequest, AnalysisResponse, DifficultyLevel, QuestionType,
    PaginatedResponse, StatsResponse
)
from data_manager import CSVDataManager
from ai_engine import AIEngine
from data_manager import safe_safe_print as safe_print

router = APIRouter(prefix="/mistakes", tags=["错题管理"])

# 初始化数据管理器和AI引擎
data_manager = CSVDataManager()
ai_engine = AIEngine()

@router.post("", response_model=MistakeResponse)
async def create_mistake(mistake: MistakeCreate):
    """创建新的错题记录"""
    try:
        mistake_id = data_manager.create_mistake(mistake)
        created_mistake = data_manager.get_mistake(mistake_id)
        if not created_mistake:
            raise HTTPException(status_code=500, detail="创建错题后无法获取记录")
        return created_mistake
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建错题失败: {str(e)}")

@router.get("", response_model=PaginatedResponse[MistakeResponse])
async def get_mistakes(
    page: int = Query(1, ge=1, description="页码，从1开始"),
    page_size: int = Query(12, ge=1, le=100, description="每页记录数"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    keyword: Optional[str] = Query(None, description="搜索关键词（兼容旧参数）"),
    tags: Optional[str] = Query(None, description="知识点标签，用逗号分隔"),
    knowledge_tag: Optional[str] = Query(None, description="单个知识点标签（前端参数名）"),
    difficulty: Optional[DifficultyLevel] = Query(None, description="难度级别"),
    question_type: Optional[QuestionType] = Query(None, description="题目类型")
):
    """获取错题列表"""
    try:
        # 解析标签：优先使用tags参数，其次使用knowledge_tag参数
        tag_list = None
        if tags:
            tag_list = tags.split(",")
        elif knowledge_tag:
            tag_list = [knowledge_tag]

        # 兼容性处理：优先使用search，其次使用keyword
        search_keyword = search if search is not None else keyword

        # 搜索错题
        mistakes = data_manager.search_mistakes(
            keyword=search_keyword,
            tags=tag_list,
            difficulty=difficulty,
            question_type=question_type
        )

        # 计算分页数据
        total = len(mistakes)
        total_pages = (total + page_size - 1) // page_size if page_size > 0 else 0

        # 分页计算
        skip = (page - 1) * page_size
        end_idx = skip + page_size
        paginated_items = mistakes[skip:end_idx]

        # 返回分页响应
        return PaginatedResponse[MistakeResponse](
            items=paginated_items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取错题列表失败: {str(e)}")

@router.get("/{mistake_id}", response_model=MistakeResponse)
async def get_mistake(mistake_id: str):
    """根据ID获取错题详情"""
    mistake = data_manager.get_mistake(mistake_id)
    if not mistake:
        raise HTTPException(status_code=404, detail="错题不存在")
    return mistake

@router.put("/{mistake_id}", response_model=MistakeResponse)
async def update_mistake(mistake_id: str, update: MistakeUpdate):
    """更新错题记录"""
    success = data_manager.update_mistake(mistake_id, update)
    if not success:
        raise HTTPException(status_code=404, detail="错题不存在或更新失败")

    updated_mistake = data_manager.get_mistake(mistake_id)
    if not updated_mistake:
        raise HTTPException(status_code=500, detail="更新后无法获取错题")

    return updated_mistake

@router.delete("/{mistake_id}")
async def delete_mistake(mistake_id: str):
    """删除错题记录"""
    success = data_manager.delete_mistake(mistake_id)
    if not success:
        raise HTTPException(status_code=404, detail="错题不存在或删除失败")
    return {"message": "错题删除成功", "mistake_id": mistake_id}

@router.post("/{mistake_id}/analyze", response_model=AnalysisResponse)
async def analyze_mistake(mistake_id: str):
    """AI分析错题"""
    # 先获取错题信息
    mistake = data_manager.get_mistake(mistake_id)
    if not mistake:
        raise HTTPException(status_code=404, detail="错题不存在")

    # 创建分析请求
    request = AnalysisRequest(
        mistake_id=mistake_id,
        question_content=mistake.question_content,
        wrong_process=mistake.wrong_process,
        wrong_answer=mistake.wrong_answer,
        correct_answer=mistake.correct_answer
    )

    # 调用AI引擎分析
    try:
        analysis = ai_engine.analyze_mistake(request)

        # 保存分析结果到数据系统
        success = data_manager.update_mistake_analysis(mistake_id, analysis)
        if not success:
            safe_print(f"[WARN] 分析结果保存失败，但分析已完成: {mistake_id}")
        else:
            safe_print(f"[OK] 分析结果已保存到错题记录: {mistake_id}")

        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI分析失败: {str(e)}")

@router.get("/stats/summary", response_model=StatsResponse)
async def get_statistics():
    """获取错题统计摘要"""
    try:
        stats = data_manager.get_statistics()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取统计信息失败: {str(e)}")

@router.get("/types/list")
async def get_question_types():
    """获取所有题目类型"""
    return [{"value": t.value, "name": t.name} for t in QuestionType]

@router.get("/difficulty/list")
async def get_difficulty_levels():
    """获取所有难度级别"""
    return [{"value": d.value, "name": d.name} for d in DifficultyLevel]