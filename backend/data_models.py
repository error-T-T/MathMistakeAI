"""
错题数据模型
作者: Rookie (error-T-T) & 艾可希雅
GitHub ID: error-T-T
学校邮箱: RookieT@e.gzhu.edu.cn
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Generic, TypeVar
from datetime import datetime
from enum import Enum

class DifficultyLevel(str, Enum):
    """难度级别枚举"""
    EASY = "简单"
    MEDIUM = "中等"
    HARD = "困难"
    EXPERT = "专家"

class QuestionType(str, Enum):
    """题目类型枚举"""
    CALCULATION = "计算题"
    PROOF = "证明题"
    APPLICATION = "应用题"
    CHOICE = "选择题"
    FILL_BLANK = "填空题"
    COMPREHENSIVE = "综合题"

class MistakeCreate(BaseModel):
    """创建错题的请求模型"""
    question_content: str = Field(..., description="题目内容")
    wrong_process: str = Field(..., description="错误过程描述")
    wrong_answer: str = Field(..., description="错误答案")
    correct_answer: str = Field(..., description="正确答案")
    question_type: QuestionType = Field(default=QuestionType.CALCULATION, description="题目类型")
    knowledge_tags: List[str] = Field(default_factory=list, description="知识点标签")
    difficulty: DifficultyLevel = Field(default=DifficultyLevel.MEDIUM, description="难度级别")
    source: Optional[str] = Field(None, description="题目来源")
    notes: Optional[str] = Field(None, description="个人笔记")

class MistakeResponse(BaseModel):
    """错题响应模型"""
    id: str = Field(..., description="错题ID")
    question_content: str = Field(..., description="题目内容")
    wrong_process: str = Field(..., description="错误过程描述")
    wrong_answer: str = Field(..., description="错误答案")
    correct_answer: str = Field(..., description="正确答案")
    question_type: QuestionType = Field(..., description="题目类型")
    knowledge_tags: List[str] = Field(..., description="知识点标签")
    difficulty: DifficultyLevel = Field(..., description="难度级别")
    source: Optional[str] = Field(None, description="题目来源")
    notes: Optional[str] = Field(None, description="个人笔记")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")
    analysis_result: Optional[Dict[str, Any]] = Field(None, description="AI分析结果")

    class Config:
        from_attributes = True

class MistakeUpdate(BaseModel):
    """更新错题的请求模型"""
    question_content: Optional[str] = Field(None, description="题目内容")
    wrong_process: Optional[str] = Field(None, description="错误过程描述")
    wrong_answer: Optional[str] = Field(None, description="错误答案")
    correct_answer: Optional[str] = Field(None, description="正确答案")
    question_type: Optional[QuestionType] = Field(None, description="题目类型")
    knowledge_tags: Optional[List[str]] = Field(None, description="知识点标签")
    difficulty: Optional[DifficultyLevel] = Field(None, description="难度级别")
    source: Optional[str] = Field(None, description="题目来源")
    notes: Optional[str] = Field(None, description="个人笔记")

class AnalysisRequest(BaseModel):
    """AI分析请求模型"""
    mistake_id: str = Field(..., description="错题ID")
    question_content: str = Field(..., description="题目内容")
    wrong_process: str = Field(..., description="错误过程描述")
    wrong_answer: str = Field(..., description="错误答案")
    correct_answer: str = Field(..., description="正确答案")

class AnalysisResponse(BaseModel):
    """AI分析响应模型"""
    mistake_id: str = Field(..., description="错题ID")
    error_type: str = Field(..., description="错误类型分类")
    root_cause: str = Field(..., description="错误根源分析")
    knowledge_gap: List[str] = Field(..., description="知识漏洞")
    learning_suggestions: List[str] = Field(..., description="学习建议")
    similar_examples: List[str] = Field(..., description="类似题目示例")
    confidence_score: float = Field(..., ge=0, le=1, description="分析置信度")

class StatsResponse(BaseModel):
    """统计信息响应模型"""
    total_mistakes: int = Field(..., description="总错题数")
    mistakes_by_type: Dict[str, int] = Field(..., description="按类型统计")
    mistakes_by_difficulty: Dict[str, int] = Field(..., description="按难度统计")
    top_knowledge_gaps: List[str] = Field(..., description="高频知识漏洞")
    accuracy_trend: List[float] = Field(..., description="正确率趋势")


# 泛型类型变量
T = TypeVar('T')

class PaginatedResponse(BaseModel, Generic[T]):
    """分页响应模型"""
    items: List[T] = Field(..., description="当前页数据项")
    total: int = Field(..., description="总记录数")
    page: int = Field(..., description="当前页码")
    page_size: int = Field(..., description="每页记录数")
    total_pages: int = Field(..., description="总页数")