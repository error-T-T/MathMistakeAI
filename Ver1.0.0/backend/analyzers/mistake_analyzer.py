"""
错题分析器模块：处理错题的AI分析逻辑
应用AI技术：自然语言处理、特征提取、文本生成
"""

from typing import Dict, Any, Optional
import sys
import os

# 添加当前目录到系统路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai_engine import analyze_mistake as ai_analyze_mistake, extract_formulas
from data import data_manager


def analyze_mistake_by_id(mistake_id: str) -> Dict[str, Any]:
    """
    根据错题ID分析错题
    参数:
        mistake_id: 错题ID
    返回:
        Dict[str, Any]: 分析结果
    """
    # 获取错题数据
    mistake = data_manager.get_mistake_by_id(mistake_id)
    if not mistake:
        raise ValueError(f"错题ID {mistake_id} 不存在")
    
    # 调用AI引擎进行分析
    try:
        # 准备参数
        knowledge_points_str = ",".join(mistake["knowledge_points"])
        
        # 调用AI分析
        ai_result = ai_analyze_mistake(
            question_text=mistake["question_content"],
            wrong_process=mistake["wrong_process"],
            wrong_answer=mistake["wrong_answer"],
            correct_answer=mistake["correct_answer"],
            knowledge_points=knowledge_points_str,
            question_type=mistake["question_type"],
            difficulty_level=mistake["difficulty_level"]
        )
        
        # 构建最终分析结果
        analysis_result = {
            "mistake_id": mistake_id,
            "formula_extraction": ai_result.get("数学公式提取", {}).get("提取的公式", extract_formulas(mistake["question_content"])),
            "error_type": ai_result.get("错误类型诊断", {}).get("错误类型", "未知"),
            "error_reason": ai_result.get("错误原因详细分析", {}).get("错误原因", "未知"),
            "step_by_step_solution": ai_result.get("分步骤正确解析", {}).get("解析步骤", []),
            "general_method": ai_result.get("通用解法总结", {}).get("通用解法", ""),
            "specific_strategy": ai_result.get("特定解题策略", {}).get("特定策略", "")
        }
        
        return analysis_result
    except Exception as e:
        raise Exception(f"分析错题失败: {str(e)}")


def analyze_mistake(mistake: Dict[str, Any]) -> Dict[str, Any]:
    """
    分析错题数据
    参数:
        mistake: 错题数据
    返回:
        Dict[str, Any]: 分析结果
    """
    try:
        # 准备参数
        knowledge_points_str = ",".join(mistake["knowledge_points"])
        
        # 调用AI分析
        ai_result = ai_analyze_mistake(
            question_text=mistake["question_content"],
            wrong_process=mistake["wrong_process"],
            wrong_answer=mistake["wrong_answer"],
            correct_answer=mistake["correct_answer"],
            knowledge_points=knowledge_points_str,
            question_type=mistake["question_type"],
            difficulty_level=mistake["difficulty_level"]
        )
        
        # 构建最终分析结果
        analysis_result = {
            "mistake_id": mistake["id"],
            "formula_extraction": ai_result.get("数学公式提取", {}).get("提取的公式", extract_formulas(mistake["question_content"])),
            "error_type": ai_result.get("错误类型诊断", {}).get("错误类型", "未知"),
            "error_reason": ai_result.get("错误原因详细分析", {}).get("错误原因", "未知"),
            "step_by_step_solution": ai_result.get("分步骤正确解析", {}).get("解析步骤", []),
            "general_method": ai_result.get("通用解法总结", {}).get("通用解法", ""),
            "specific_strategy": ai_result.get("特定解题策略", {}).get("特定策略", "")
        }
        
        return analysis_result
    except Exception as e:
        raise Exception(f"分析错题失败: {str(e)}")


def batch_analyze_mistakes(mistake_ids: list) -> Dict[str, Any]:
    """
    批量分析错题
    参数:
        mistake_ids: 错题ID列表
    返回:
        Dict[str, Any]: 批量分析结果
    """
    results = {}
    errors = {}
    
    for mistake_id in mistake_ids:
        try:
            result = analyze_mistake_by_id(mistake_id)
            results[mistake_id] = result
        except Exception as e:
            errors[mistake_id] = str(e)
    
    return {
        "results": results,
        "errors": errors,
        "total_success": len(results),
        "total_errors": len(errors)
    }
