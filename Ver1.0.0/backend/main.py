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
from typing import List, Optional
import os
import sys

# 添加当前目录到系统路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 导入数据处理模块
from data import data_manager

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
    question_type: str
    question_content: str
    wrong_process: str
    wrong_answer: str
    correct_answer: str
    knowledge_points: List[str]
    difficulty_level: str
    message: Optional[str] = None

class ImportResponse(BaseModel):
    success: bool
    message: str
    mistakes: Optional[List[MistakeResponse]] = None

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

# 运行服务器
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)