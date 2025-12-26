"""
项目：大学生数学错题智能分析系统 (MathMistakeAI)
作者：Rookie
GitHub仓库：https://github.com/error-T-T/MathMistakeAI
邮箱：RookieT@e.gzhu.edu.cn
版本：Ver1.0.0 (MVP)
描述：基于本地AI的个性化错题处理系统
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import sys

# 添加当前目录到系统路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 导入数据处理模块
from data import data_manager
from analyzers import mistake_analyzer
from ai_engine import generate_questions as ai_generate_questions

app = FastAPI(title="MathMistakeAI API", version="1.0.0")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该限制为前端的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 请求模型
class MistakeData(BaseModel):
    text: str

# 响应模型
class MistakeResponse(BaseModel):
    id: str
    question_id: str
    question_type: Optional[str] = None
    question_content: str
    wrong_process: Optional[str] = None
    wrong_answer: str
    correct_answer: str
    knowledge_points: List[str]
    difficulty_level: Optional[str] = None
    message: Optional[str] = None

class ImportResponse(BaseModel):
    success: bool
    message: str
    mistakes: Optional[List[MistakeResponse]] = None

class DeleteResponse(BaseModel):
    success: bool
    message: str

class AnalysisResult(BaseModel):
    mistake_id: str
    formula_extraction: List[str]
    error_type: str
    error_reason: str
    step_by_step_solution: List[str]
    general_method: str
    specific_strategy: Optional[str] = None

# 题目生成请求模型
class QuestionGenerationRequest(BaseModel):
    mistake_id: str
    similarity_level: str  # 仅改数字/同类型变形/混合知识点
    quantity: int  # 1-50
    target_difficulty: Optional[str] = None  # 简单/中等/困难

# 生成的题目响应模型
class GeneratedQuestion(BaseModel):
    question_id: str
    source_mistake_id: str
    question_content: str
    solution: str
    solution_steps: List[str]
    difficulty: str
    knowledge_points: List[str]
    generation_method: str

# 题目生成响应模型
class QuestionGenerationResponse(BaseModel):
    success: bool
    message: str
    questions: Optional[List[GeneratedQuestion]] = None
    generation_summary: Optional[Dict[str, Any]] = None

# 健康检查端点
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "MathMistakeAI API is running"}

# 导入错题数据（通过粘贴文本）
@app.post("/api/import/text", response_model=ImportResponse)
async def import_mistake_text(data: MistakeData):
    try:
        # 解析文本数据
        mistakes = data_manager.parse_mistake_text(data.text)
        
        # 保存到CSV文件
        saved_mistakes = []
        for mistake in mistakes:
            saved_mistake = data_manager.save_mistake(mistake)
            saved_mistakes.append(saved_mistake)
        
        return {
            "success": True,
            "message": f"成功导入 {len(saved_mistakes)} 道错题",
            "mistakes": saved_mistakes
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 导入错题数据（通过上传文件）
@app.post("/api/import/file", response_model=ImportResponse)
async def import_mistake_file(file: UploadFile = File(...)):
    try:
        # 读取文件内容
        content = await file.read()
        text = content.decode("utf-8")
        
        # 解析文本数据
        mistakes = data_manager.parse_mistake_text(text)
        
        # 保存到CSV文件
        saved_mistakes = []
        for mistake in mistakes:
            saved_mistake = data_manager.save_mistake(mistake)
            saved_mistakes.append(saved_mistake)
        
        return {
            "success": True,
            "message": f"成功导入 {len(saved_mistakes)} 道错题",
            "mistakes": saved_mistakes
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 获取所有错题
@app.get("/api/mistakes", response_model=List[MistakeResponse])
async def get_all_mistakes():
    try:
        mistakes = data_manager.get_all_mistakes()
        return mistakes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 获取单个错题
@app.get("/api/mistakes/{mistake_id}", response_model=MistakeResponse)
async def get_mistake(mistake_id: str):
    try:
        mistake = data_manager.get_mistake_by_id(mistake_id)
        if not mistake:
            raise HTTPException(status_code=404, detail="错题不存在")
        return mistake
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 错题分析端点
@app.post("/api/analyze", response_model=AnalysisResult)
async def analyze_mistake(request: dict):
    try:
        mistake_id = request.get("mistakeId")
        if not mistake_id:
            raise HTTPException(status_code=400, detail="缺少必要参数 mistakeId")
        
        # 调用错题分析器进行分析
        analysis = mistake_analyzer.analyze_mistake_by_id(mistake_id)
        return analysis
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 删除单个错题
@app.delete("/api/mistakes/{mistake_id}", response_model=DeleteResponse)
async def delete_mistake(mistake_id: str):
    try:
        success = data_manager.delete_mistake_by_id(mistake_id)
        if success:
            return {
                "success": True,
                "message": "错题删除成功"
            }
        else:
            raise HTTPException(status_code=404, detail="错题不存在")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 清空所有错题
@app.delete("/api/mistakes", response_model=DeleteResponse)
async def clear_all_mistakes():
    try:
        count = data_manager.clear_all_mistakes()
        return {
            "success": True,
            "message": f"已清空 {count} 道错题"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 智能题目生成端点
@app.post("/api/generate/questions", response_model=QuestionGenerationResponse)
async def generate_questions_endpoint(request: QuestionGenerationRequest):
    """
    生成智能题目
    应用AI技术：文本生成（基于原始错题生成新题目）、提示词工程（结构化生成要求）
    """
    try:
        # 验证参数
        if request.quantity < 1 or request.quantity > 50:
            raise HTTPException(status_code=400, detail="题目数量必须在1-50之间")
        
        if request.similarity_level not in ["仅改数字", "同类型变形", "混合知识点"]:
            raise HTTPException(status_code=400, detail="相似度级别必须是：仅改数字、同类型变形、混合知识点")
        
        # 获取原始错题
        mistake = data_manager.get_mistake_by_question_id(request.mistake_id)
        if not mistake:
            raise HTTPException(status_code=404, detail="原始错题不存在")
        
        # 调用AI引擎生成题目
        result = ai_generate_questions(
            source_mistake_id=mistake.get("question_id", request.mistake_id),
            question_type=mistake.get("question_type"),
            question_content=mistake.get("question_content"),
            wrong_process=mistake.get("wrong_process"),
            correct_answer=mistake.get("correct_answer"),
            knowledge_points=mistake.get("knowledge_points", []),
            difficulty_level=mistake.get("difficulty_level", "中等"),
            similarity_level=request.similarity_level,
            quantity=request.quantity,
            target_difficulty=request.target_difficulty
        )
        
        return {
            "success": True,
            "message": f"成功生成 {len(result.get('questions', []))} 道题目",
            "questions": result.get("questions", []),
            "generation_summary": result.get("generation_summary")
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 运行服务器
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)