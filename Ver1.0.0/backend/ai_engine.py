"""
AI引擎模块：封装Ollama模型调用，实现AI错题分析功能
应用AI技术：提示词工程、文本生成
"""

import os
import requests
import json
import uuid
from typing import Dict, Any, Optional

# Ollama API配置
OLLAMA_API_URL = "http://localhost:11434/api/generate"
DEFAULT_MODEL = "qwen2.5:7b"


def load_prompt_template(template_name: str) -> str:
    """
    加载提示词模板
    参数:
        template_name: 模板名称（不带扩展名）
    返回:
        str: 提示词模板内容
    """
    prompt_dir = os.path.join(os.path.dirname(__file__), "prompts")
    template_path = os.path.join(prompt_dir, f"{template_name}_prompt.txt")
    
    try:
        with open(template_path, "r", encoding="utf-8") as file:
            return file.read()
    except FileNotFoundError:
        raise Exception(f"提示词模板 {template_name}_prompt.txt 不存在")


def generate_prompt(template_name: str, **kwargs) -> str:
    """
    根据模板生成提示词
    参数:
        template_name: 模板名称（不带扩展名）
        **kwargs: 模板中需要替换的参数
    返回:
        str: 生成的提示词
    """
    template = load_prompt_template(template_name)
    return template.format(**kwargs)


def call_ollama(prompt: str, model: str = DEFAULT_MODEL) -> str:
    """
    调用Ollama API生成响应
    参数:
        prompt: 提示词
        model: 使用的模型名称
    返回:
        str: 模型生成的响应内容
    """
    try:
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False
        }
        
        response = requests.post(OLLAMA_API_URL, json=payload, timeout=300)
        response.raise_for_status()
        
        result = response.json()
        return result.get("response", "")
    except requests.exceptions.ConnectionError:
        raise Exception("无法连接到Ollama服务，请确保Ollama已安装并运行")
    except requests.exceptions.Timeout:
        raise Exception("Ollama请求超时")
    except Exception as e:
        raise Exception(f"Ollama调用失败: {str(e)}")


def analyze_mistake(
    question_text: str,
    wrong_process: str,
    wrong_answer: str,
    correct_answer: str,
    knowledge_points: str,
    question_type: str,
    difficulty_level: str
) -> Dict[str, Any]:
    """
    分析错题
    参数:
        question_text: 题目内容
        wrong_process: 错误过程
        wrong_answer: 错误答案
        correct_answer: 正确答案
        knowledge_points: 知识点标签（逗号分隔）
        question_type: 题目类型
        difficulty_level: 难度等级
    返回:
        Dict[str, Any]: 错题分析结果
    """
    # 生成提示词
    prompt = generate_prompt(
        "analysis",
        question_text=question_text,
        wrong_process=wrong_process,
        wrong_answer=wrong_answer,
        correct_answer=correct_answer,
        knowledge_points=knowledge_points,
        question_type=question_type,
        difficulty_level=difficulty_level
    )
    
    # 调用Ollama获取分析结果
    response = call_ollama(prompt)
    
    # 解析响应
    try:
        # 提取JSON格式的分析结果
        # 查找第一个{和最后一个}之间的内容
        start_idx = response.find("{")
        end_idx = response.rfind("}") + 1
        
        if start_idx == -1 or end_idx == 0:
            raise ValueError("无法从响应中提取有效JSON")
        
        json_str = response[start_idx:end_idx]
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        raise Exception(f"解析Ollama响应失败: {str(e)}")
    except Exception as e:
        raise Exception(f"处理分析结果失败: {str(e)}")


def extract_formulas(question_text: str) -> list:
    """
    从题目文本中提取数学公式
    参数:
        question_text: 题目文本
    返回:
        list: 提取的公式列表
    应用AI技术：特征提取（从文本中提取数学特征）
    """
    # 简单的公式提取实现
    # 实际应用中可以使用更复杂的正则表达式或NLP模型
    import re
    
    # 匹配LaTeX公式和常见数学符号
    patterns = [
        r'\\\[(.+?)\\\]',  # 块级LaTeX公式
        r'\\\((.+?)\\\)',  # 内联LaTeX公式
        r'∫[^∫]+dx',  # 积分
        r'lim[^lim]+→[^lim]+',  # 极限
        r'\w+\s*=\s*[^=]+',  # 方程
        r'\w+\s*<\s*[^<]+',  # 不等式
        r'\w+\s*>\s*[^>]+'   # 不等式
    ]
    
    formulas = []
    
    for pattern in patterns:
        matches = re.findall(pattern, question_text)
        formulas.extend(matches)
    
    # 去重并清理
    formulas = list(set(formulas))
    formulas = [formula.strip() for formula in formulas if formula.strip()]
    
    return formulas


def generate_questions(
    source_mistake_id: str,
    question_type: str,
    question_content: str,
    wrong_process: str,
    correct_answer: str,
    knowledge_points: list,
    difficulty_level: str,
    similarity_level: str,
    quantity: int,
    target_difficulty: str = None
) -> Dict[str, Any]:
    """
    生成智能题目
    应用AI技术：文本生成（基于原始题目生成新题目）、提示词工程（结构化生成要求）
    参数:
        source_mistake_id: 原始错题ID
        question_type: 题目类型
        question_content: 题目内容
        wrong_process: 错误过程
        correct_answer: 正确答案
        knowledge_points: 知识点列表
        difficulty_level: 原始难度等级
        similarity_level: 相似度级别（仅改数字/同类型变形/混合知识点）
        quantity: 生成数量
        target_difficulty: 目标难度（可选，如果不指定则使用原始难度）
    返回:
        Dict[str, Any]: 生成的题目结果
    """
    # 处理知识点列表
    knowledge_points_str = ", ".join(knowledge_points) if isinstance(knowledge_points, list) else knowledge_points
    
    # 确定目标难度
    final_difficulty = target_difficulty if target_difficulty else difficulty_level
    
    # 生成提示词
    prompt = generate_prompt(
        "generation",
        source_mistake_id=source_mistake_id,
        question_type=question_type or "计算题",
        question_content=question_content,
        wrong_process=wrong_process or "无",
        correct_answer=correct_answer,
        knowledge_points=knowledge_points_str,
        difficulty_level=difficulty_level or "中等",
        similarity_level=similarity_level,
        quantity=quantity,
        target_difficulty=final_difficulty
    )
    
    # 调用Ollama获取生成结果
    response = call_ollama(prompt)
    
    # 解析响应
    try:
        # 清理响应内容，移除可能的markdown代码块标记
        clean_response = response.strip()
        if clean_response.startswith("```json"):
            clean_response = clean_response[7:]
        if clean_response.startswith("```"):
            clean_response = clean_response[3:]
        if clean_response.endswith("```"):
            clean_response = clean_response[:-3]
        clean_response = clean_response.strip()
        
        # 查找JSON内容
        start_idx = clean_response.find("{")
        end_idx = clean_response.rfind("}") + 1
        
        if start_idx == -1 or end_idx == 0:
            raise ValueError("无法从响应中提取有效JSON")
        
        json_str = clean_response[start_idx:end_idx]
        result = json.loads(json_str)
        
        # 为每个生成的题目添加源ID
        if "questions" in result:
            for question in result["questions"]:
                question["source_mistake_id"] = source_mistake_id
                # 生成唯一ID
                if "question_id" not in question:
                    question["question_id"] = f"QGEN-{uuid.uuid4().hex[:8].upper()}"
        
        return result
    except json.JSONDecodeError as e:
        raise Exception(f"解析Ollama响应失败: {str(e)}")
    except Exception as e:
        raise Exception(f"处理生成结果失败: {str(e)}")
