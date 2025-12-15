"""
错题文本解析器
用于解析固定格式的错题文本文件
格式说明：
- 每个错题用空行分隔
- 字段格式：[字段名] 值
- 支持的字段：[题目ID], [题目类型], [题目内容], [错误过程], [错误答案], [正确答案], [知识点标签], [难度等级]

作者: Rookie (error-T-T) & 艾可希雅
GitHub ID: error-T-T
学校邮箱: RookieT@e.gzhu.edu.cn
"""

import re
from typing import List, Dict, Optional, Tuple
from enum import Enum

# 直接导入（已通过sys.path设置）
from data_models import MistakeCreate, DifficultyLevel, QuestionType


class ParseError(Exception):
    """解析错误"""
    pass


class TextParser:
    """文本解析器"""

    # 支持的字段列表
    SUPPORTED_FIELDS = {
        '题目ID': 'id',
        '题目类型': 'question_type',
        '题目内容': 'question_content',
        '错误过程': 'wrong_process',
        '错误答案': 'wrong_answer',
        '正确答案': 'correct_answer',
        '知识点标签': 'knowledge_tags',
        '难度等级': 'difficulty'
    }

    @staticmethod
    def parse_text(content: str) -> List[Dict[str, str]]:
        """
        解析文本内容，返回错题字典列表

        Args:
            content: 文本内容

        Returns:
            List[Dict[str, str]]: 解析后的错题字典列表

        Raises:
            ParseError: 解析失败时抛出
        """
        # 按空行分割成错题块
        blocks = re.split(r'\n\s*\n', content.strip())
        mistakes = []

        for block_idx, block in enumerate(blocks):
            if not block.strip():
                continue

            try:
                mistake_dict = TextParser._parse_block(block.strip())
                if mistake_dict:
                    mistakes.append(mistake_dict)
            except Exception as e:
                raise ParseError(f"第{block_idx + 1}个错题块解析失败: {str(e)}")

        return mistakes

    @staticmethod
    def _parse_block(block: str) -> Dict[str, str]:
        """解析单个错题块"""
        lines = block.split('\n')
        mistake_dict = {}

        for line_idx, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue

            # 匹配 [字段名] 值 格式
            match = re.match(r'^\[([^\]]+)\]\s*(.+)$', line)
            if not match:
                raise ParseError(f"第{line_idx + 1}行格式错误: {line}")

            field_name = match.group(1).strip()
            field_value = match.group(2).strip()

            # 检查字段是否支持
            if field_name not in TextParser.SUPPORTED_FIELDS:
                raise ParseError(f"第{line_idx + 1}行包含不支持的字段: {field_name}")

            # 存储字段值（使用英文字段名）
            english_field = TextParser.SUPPORTED_FIELDS[field_name]
            mistake_dict[english_field] = field_value

        return mistake_dict

    @staticmethod
    def validate_mistake_dict(mistake_dict: Dict[str, str]) -> Tuple[bool, List[str]]:
        """
        验证错题字典的完整性

        Args:
            mistake_dict: 错题字典

        Returns:
            Tuple[bool, List[str]]: (是否有效, 错误消息列表)
        """
        errors = []

        # 必需字段检查（除了id和source/notes）
        required_fields = ['question_content', 'wrong_process', 'wrong_answer', 'correct_answer']
        for field in required_fields:
            if field not in mistake_dict or not mistake_dict[field]:
                errors.append(f"缺少必需字段: {field}")

        # 知识点标签格式检查
        if 'knowledge_tags' in mistake_dict:
            tags_str = mistake_dict['knowledge_tags']
            if not isinstance(tags_str, str):
                errors.append(f"知识点标签必须是字符串: {tags_str}")

        # 难度级别验证
        if 'difficulty' in mistake_dict:
            difficulty = mistake_dict['difficulty']
            valid_difficulties = [level.value for level in DifficultyLevel]
            if difficulty not in valid_difficulties:
                errors.append(f"无效的难度级别: {difficulty}，有效值: {', '.join(valid_difficulties)}")

        # 题目类型验证
        if 'question_type' in mistake_dict:
            question_type = mistake_dict['question_type']
            valid_types = [qt.value for qt in QuestionType]
            if question_type not in valid_types:
                errors.append(f"无效的题目类型: {question_type}，有效值: {', '.join(valid_types)}")

        return len(errors) == 0, errors

    @staticmethod
    def convert_to_mistake_create(mistake_dict: Dict[str, str]) -> MistakeCreate:
        """
        将解析后的字典转换为MistakeCreate对象

        Args:
            mistake_dict: 解析后的错题字典

        Returns:
            MistakeCreate: 创建的错题对象

        Raises:
            ValueError: 转换失败时抛出
        """
        # 验证数据
        is_valid, errors = TextParser.validate_mistake_dict(mistake_dict)
        if not is_valid:
            raise ValueError(f"数据验证失败: {'; '.join(errors)}")

        # 处理知识点标签（逗号分隔的字符串转列表）
        knowledge_tags = []
        if 'knowledge_tags' in mistake_dict:
            tags_str = mistake_dict['knowledge_tags']
            # 按逗号分割，去除空格和空值
            knowledge_tags = [tag.strip() for tag in tags_str.split(',') if tag.strip()]

        # 创建MistakeCreate对象
        return MistakeCreate(
            question_content=mistake_dict['question_content'],
            wrong_process=mistake_dict['wrong_process'],
            wrong_answer=mistake_dict['wrong_answer'],
            correct_answer=mistake_dict['correct_answer'],
            question_type=QuestionType(mistake_dict.get('question_type', '计算题')),
            knowledge_tags=knowledge_tags,
            difficulty=DifficultyLevel(mistake_dict.get('difficulty', '中等')),
            source=mistake_dict.get('source', '文本导入'),
            notes=mistake_dict.get('notes', '')
        )

    @staticmethod
    def parse_and_convert(content: str) -> List[MistakeCreate]:
        """
        解析文本并转换为MistakeCreate对象列表

        Args:
            content: 文本内容

        Returns:
            List[MistakeCreate]: 错题对象列表

        Raises:
            ParseError: 解析或转换失败时抛出
        """
        try:
            # 解析文本
            mistake_dicts = TextParser.parse_text(content)
            mistake_objects = []

            for idx, mistake_dict in enumerate(mistake_dicts):
                try:
                    # 转换为MistakeCreate对象
                    mistake_obj = TextParser.convert_to_mistake_create(mistake_dict)
                    mistake_objects.append(mistake_obj)
                except Exception as e:
                    raise ParseError(f"第{idx + 1}个错题转换失败: {str(e)}")

            return mistake_objects
        except Exception as e:
            raise ParseError(f"解析失败: {str(e)}")