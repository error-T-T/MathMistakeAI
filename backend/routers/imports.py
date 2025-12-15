"""
数据导入API路由
支持文件上传和文本粘贴两种方式导入错题数据

作者: Rookie (error-T-T) & 艾可希雅
GitHub ID: error-T-T
学校邮箱: RookieT@e.gzhu.edu.cn
"""

import sys
import os
from typing import List, Dict, Any
from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# 添加父目录到Python路径，确保可以导入本地模块
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from data_models import MistakeCreate
from data_manager import CSVDataManager
from parsers.text_parser import TextParser, ParseError

router = APIRouter(prefix="/import", tags=["数据导入"])

# 初始化数据管理器
data_manager = CSVDataManager()


class ImportResponse(BaseModel):
    """导入响应模型"""
    total_processed: int = Field(..., description="总共处理的错题数")
    successful: int = Field(..., description="成功导入的错题数")
    failed: int = Field(..., description="导入失败的错题数")
    failed_details: List[Dict[str, Any]] = Field(default_factory=list, description="失败详情")
    warning_messages: List[str] = Field(default_factory=list, description="警告消息")


@router.post("/file", response_model=ImportResponse)
async def import_from_file(
    file: UploadFile = File(..., description="错题文本文件（.txt格式）")
):
    """
    从文件导入错题数据

    支持的文件格式：
    - 每个错题用空行分隔
    - 字段格式：[字段名] 值
    - 支持的字段：[题目ID], [题目类型], [题目内容], [错误过程], [错误答案], [正确答案], [知识点标签], [难度等级]

    示例：
    [题目类型] 计算题
    [题目内容] 计算∫(0 to 1) x^2 dx
    [错误过程] 我用了基本积分公式，但忘记了上下限
    [错误答案] 1/3
    [正确答案] 1/3
    [知识点标签] 定积分, 微积分基本定理
    [难度等级] 中等
    """
    # 检查文件类型
    if not file.filename.endswith('.txt'):
        raise HTTPException(
            status_code=400,
            detail="只支持.txt格式的文本文件"
        )

    try:
        # 读取文件内容
        content_bytes = await file.read()
        content = content_bytes.decode('utf-8')

        # 解析文本
        mistake_objects = TextParser.parse_and_convert(content)

        # 导入数据
        result = _import_mistakes(mistake_objects)

        return JSONResponse(
            content=result,
            status_code=200
        )

    except ParseError as e:
        raise HTTPException(status_code=400, detail=f"文件解析失败: {str(e)}")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="文件编码错误，请使用UTF-8编码")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"导入失败: {str(e)}")


@router.post("/text", response_model=ImportResponse)
async def import_from_text(
    text_content: str = Body(..., description="错题文本内容", embed=True)
):
    """
    从文本内容导入错题数据

    支持的文本格式：
    - 每个错题用空行分隔
    - 字段格式：[字段名] 值
    - 支持的字段：[题目ID], [题目类型], [题目内容], [错误过程], [错误答案], [正确答案], [知识点标签], [难度等级]

    示例：
    [题目类型] 计算题
    [题目内容] 计算∫(0 to 1) x^2 dx
    [错误过程] 我用了基本积分公式，但忘记了上下限
    [错误答案] 1/3
    [正确答案] 1/3
    [知识点标签] 定积分, 微积分基本定理
    [难度等级] 中等
    """
    try:
        # 解析文本
        mistake_objects = TextParser.parse_and_convert(text_content)

        # 导入数据
        result = _import_mistakes(mistake_objects)

        return JSONResponse(
            content=result,
            status_code=200
        )

    except ParseError as e:
        raise HTTPException(status_code=400, detail=f"文本解析失败: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"导入失败: {str(e)}")


def _import_mistakes(mistake_objects: List[MistakeCreate]) -> Dict[str, Any]:
    """
    导入错题到数据系统

    Args:
        mistake_objects: 错题对象列表

    Returns:
        Dict[str, Any]: 导入结果统计
    """
    total_processed = len(mistake_objects)
    successful = 0
    failed = 0
    failed_details = []
    warning_messages = []

    for idx, mistake in enumerate(mistake_objects):
        try:
            # 创建错题记录
            mistake_id = data_manager.create_mistake(mistake)
            successful += 1

            # 添加警告信息（如果有些字段缺失）
            if not mistake.knowledge_tags:
                warning_messages.append(f"第{idx + 1}条记录缺少知识点标签")

        except Exception as e:
            failed += 1
            failed_details.append({
                "index": idx + 1,
                "error": str(e),
                "question_content": mistake.question_content[:50] + "..." if len(mistake.question_content) > 50 else mistake.question_content
            })

    return {
        "total_processed": total_processed,
        "successful": successful,
        "failed": failed,
        "failed_details": failed_details,
        "warning_messages": warning_messages,
        "message": f"成功导入{successful}条记录，失败{failed}条记录"
    }


@router.get("/sample")
async def get_sample_format():
    """
    获取数据导入格式示例

    返回标准格式的示例文本
    """
    sample_text = """[题目ID] Q001
[题目类型] 计算题
[题目内容] 计算∫(0 to 1) x^2 dx
[错误过程] 我用了基本积分公式，但忘记了上下限
[错误答案] 1/3
[正确答案] 1/3
[知识点标签] 定积分, 微积分基本定理
[难度等级] 中等

[题目ID] Q002
[题目类型] 计算题
[题目内容] 求函数f(x) = x^3 - 3x^2 + 2的极值点
[错误过程] 求导得到f'(x)=3x^2-6x，令其等于0得到x=0,2，但没有判断极大极小
[错误答案] 极值点为x=0,2
[正确答案] 极大值点x=0，极小值点x=2
[知识点标签] 导数应用, 极值问题
[难度等级] 中等"""

    return JSONResponse(
        content={
            "format_description": "每个错题用空行分隔，字段格式为[字段名] 值",
            "supported_fields": [
                "题目ID", "题目类型", "题目内容", "错误过程",
                "错误答案", "正确答案", "知识点标签", "难度等级"
            ],
            "sample": sample_text
        },
        status_code=200
    )