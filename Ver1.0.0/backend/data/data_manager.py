"""
数据管理模块：处理错题数据的解析、存储和检索
应用AI技术：特征提取（从文本中提取结构化数据）
"""

import csv
import os
import re
from typing import List, Dict, Optional
import uuid

# 定义CSV文件路径
MISTAKES_CSV = os.path.join(os.path.dirname(__file__), "mistakes.csv")

# 定义模板字段
TEMPLATE_FIELDS = [
    "题目ID",
    "题目类型",
    "题目内容",
    "错误过程",
    "错误答案",
    "正确答案",
    "知识点标签",
    "难度等级"
]

def initialize_csv():
    """初始化CSV文件（如果不存在）"""
    if not os.path.exists(MISTAKES_CSV):
        with open(MISTAKES_CSV, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.DictWriter(file, fieldnames=[
                "id", "question_id", "question_type", "question_content", 
                "wrong_process", "wrong_answer", "correct_answer", 
                "knowledge_points", "difficulty_level"
            ])
            writer.writeheader()

# 初始化CSV文件
initialize_csv()


def parse_mistake_text(text: str) -> List[Dict]:
    """
    解析符合模板的错题文本数据
    应用AI技术：自然语言处理（文本结构化提取）
    """
    mistakes = []
    
    # 按照模板分割题目
    # 查找所有以"[题目ID]"开头的部分
    pattern = r'\[题目ID\]\s+Q\d+'
    matches = list(re.finditer(pattern, text))
    
    if not matches:
        raise ValueError("未找到符合模板的错题数据")
    
    # 分割每个题目
    for i in range(len(matches)):
        start = matches[i].start()
        end = matches[i+1].start() if i+1 < len(matches) else len(text)
        question_text = text[start:end]
        
        # 解析单个题目
        mistake = parse_single_mistake(question_text)
        if mistake:
            mistakes.append(mistake)
    
    return mistakes


def parse_single_mistake(question_text: str) -> Optional[Dict]:
    """
    解析单个错题数据
    应用AI技术：正则表达式匹配（特征提取）
    """
    mistake = {
        "id": str(uuid.uuid4()),  # 生成唯一ID
    }
    
    for field in TEMPLATE_FIELDS:
        pattern = rf'\[{field}\]\s*(.+?)(?=\[|$)'  # 非贪婪匹配，直到下一个[或结束
        match = re.search(pattern, question_text, re.DOTALL)
        if match:
            value = match.group(1).strip()
            
            # 处理知识点标签（转换为列表）
            if field == "知识点标签":
                value = [tag.strip() for tag in value.split(",")]
            
            # 转换字段名（中文到英文）
            if field == "题目ID":
                mistake["question_id"] = value
            elif field == "题目类型":
                mistake["question_type"] = value
            elif field == "题目内容":
                mistake["question_content"] = value
            elif field == "错误过程":
                mistake["wrong_process"] = value
            elif field == "错误答案":
                mistake["wrong_answer"] = value
            elif field == "正确答案":
                mistake["correct_answer"] = value
            elif field == "知识点标签":
                mistake["knowledge_points"] = value
            elif field == "难度等级":
                mistake["difficulty_level"] = value
        else:
            # 如果缺少必要字段，返回None
            if field in ["题目ID", "题目内容", "错误答案", "正确答案"]:
                return None
    
    # 验证必要字段
    required_fields = ["question_id", "question_content", "wrong_answer", "correct_answer"]
    for field in required_fields:
        if field not in mistake:
            return None
    
    return mistake


def save_mistake(mistake: Dict) -> Dict:
    """
    将错题数据保存到CSV文件
    """
    # 确保知识点标签是字符串格式
    if isinstance(mistake["knowledge_points"], list):
        mistake["knowledge_points"] = ",".join(mistake["knowledge_points"])
    
    with open(MISTAKES_CSV, mode='a', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=[
            "id", "question_id", "question_type", "question_content", 
            "wrong_process", "wrong_answer", "correct_answer", 
            "knowledge_points", "difficulty_level"
        ])
        writer.writerow(mistake)
    
    # 转换知识点标签回列表格式
    if isinstance(mistake["knowledge_points"], str):
        mistake["knowledge_points"] = [tag.strip() for tag in mistake["knowledge_points"].split(",")]
    
    return mistake


def get_all_mistakes() -> List[Dict]:
    """
    获取所有错题数据
    """
    mistakes = []
    
    if not os.path.exists(MISTAKES_CSV):
        return mistakes
    
    with open(MISTAKES_CSV, mode='r', newline='', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            # 转换知识点标签为列表格式
            if row.get("knowledge_points"):
                row["knowledge_points"] = [tag.strip() for tag in row["knowledge_points"].split(",")]
            mistakes.append(row)
    
    return mistakes


def get_mistake_by_id(mistake_id: str) -> Optional[Dict]:
    """
    根据ID获取错题数据
    """
    mistakes = get_all_mistakes()
    for mistake in mistakes:
        if mistake["id"] == mistake_id:
            return mistake
    return None


def get_mistakes_by_knowledge_point(knowledge_point: str) -> List[Dict]:
    """
    根据知识点获取错题数据
    """
    mistakes = get_all_mistakes()
    result = []
    
    for mistake in mistakes:
        if isinstance(mistake.get("knowledge_points"), list):
            if knowledge_point in mistake["knowledge_points"]:
                result.append(mistake)
    
    return result


def get_mistakes_by_difficulty(difficulty: str) -> List[Dict]:
    """
    根据难度获取错题数据
    """
    mistakes = get_all_mistakes()
    result = []
    
    for mistake in mistakes:
        if mistake.get("difficulty_level") == difficulty:
            result.append(mistake)
    
    return result
