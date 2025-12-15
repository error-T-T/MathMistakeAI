"""
CSV数据管理模块
作者: Rookie (error-T-T) & 艾可希雅
GitHub ID: error-T-T
学校邮箱: RookieT@e.gzhu.edu.cn
"""

import csv
import os
import pandas as pd
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
from data_models import MistakeCreate, MistakeResponse, MistakeUpdate, DifficultyLevel, QuestionType

def safe_safe_print(text: str):
    """安全打印函数，处理Windows控制台编码问题"""
    try:
        safe_print(text)
    except UnicodeEncodeError:
        # 如果标准打印失败，尝试直接写入stdout的buffer
        try:
            import sys
            sys.stdout.buffer.write(text.encode('utf-8') + b'\n')
            sys.stdout.buffer.flush()
        except:
            # 如果连buffer写入都失败，使用ASCII回退
            safe_text = text.encode('ascii', errors='replace').decode('ascii')
            safe_print(safe_text)


class CSVDataManager:
    """CSV数据管理器"""

    def __init__(self, file_path: str = "data/mistakes.csv"):
        """初始化数据管理器"""
        self.file_path = file_path
        self._ensure_data_directory()
        self._ensure_file_exists()

    def _ensure_data_directory(self):
        """确保数据目录存在"""
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)

    def _ensure_file_exists(self):
        """确保CSV文件存在，并创建表头"""
        if not os.path.exists(self.file_path):
            with open(self.file_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow([
                    'id', 'question_content', 'wrong_process', 'wrong_answer',
                    'correct_answer', 'question_type', 'knowledge_tags',
                    'difficulty', 'source', 'notes', 'created_at', 'updated_at'
                ])
            safe_print(f"[FILE] 创建了新的数据文件: {self.file_path}")

    def create_mistake(self, mistake: MistakeCreate) -> str:
        """创建新的错题记录"""
        mistake_id = str(uuid.uuid4())[:8]  # 生成8位ID
        created_at = datetime.now().isoformat()
        updated_at = created_at

        # 准备数据行
        row = [
            mistake_id,
            mistake.question_content,
            mistake.wrong_process,
            mistake.wrong_answer,
            mistake.correct_answer,
            mistake.question_type.value,
            ','.join(mistake.knowledge_tags),
            mistake.difficulty.value,
            mistake.source or '',
            mistake.notes or '',
            created_at,
            updated_at
        ]

        # 写入CSV
        with open(self.file_path, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(row)

        safe_print(f"[OK] 创建了错题记录: {mistake_id}")
        return mistake_id

    def get_mistake(self, mistake_id: str) -> Optional[MistakeResponse]:
        """根据ID获取错题记录"""
        try:
            df = pd.read_csv(self.file_path)
            row = df[df['id'] == mistake_id]

            if row.empty:
                return None

            # 转换为MistakeResponse对象
            return self._row_to_mistake_response(row.iloc[0])
        except Exception as e:
            safe_print(f"[ERROR] 获取错题失败: {e}")
            return None

    def get_all_mistakes(self) -> List[MistakeResponse]:
        """获取所有错题记录"""
        try:
            df = pd.read_csv(self.file_path)
            if df.empty:
                return []

            mistakes = []
            for _, row in df.iterrows():
                mistake = self._row_to_mistake_response(row)
                if mistake:
                    mistakes.append(mistake)

            return mistakes
        except Exception as e:
            safe_print(f"[ERROR] 获取所有错题失败: {e}")
            return []

    def update_mistake(self, mistake_id: str, update: MistakeUpdate) -> bool:
        """更新错题记录"""
        try:
            df = pd.read_csv(self.file_path)

            if mistake_id not in df['id'].values:
                return False

            # 更新字段
            idx = df[df['id'] == mistake_id].index[0]

            if update.question_content is not None:
                df.at[idx, 'question_content'] = update.question_content

            if update.wrong_process is not None:
                df.at[idx, 'wrong_process'] = update.wrong_process

            if update.wrong_answer is not None:
                df.at[idx, 'wrong_answer'] = update.wrong_answer

            if update.correct_answer is not None:
                df.at[idx, 'correct_answer'] = update.correct_answer

            if update.question_type is not None:
                df.at[idx, 'question_type'] = update.question_type.value

            if update.knowledge_tags is not None:
                df.at[idx, 'knowledge_tags'] = ','.join(update.knowledge_tags)

            if update.difficulty is not None:
                df.at[idx, 'difficulty'] = update.difficulty.value

            if update.source is not None:
                df.at[idx, 'source'] = update.source

            if update.notes is not None:
                df.at[idx, 'notes'] = update.notes

            # 更新更新时间
            df.at[idx, 'updated_at'] = datetime.now().isoformat()

            # 保存回CSV
            df.to_csv(self.file_path, index=False)

            safe_print(f"[OK] 更新了错题记录: {mistake_id}")
            return True
        except Exception as e:
            safe_print(f"[ERROR] 更新错题失败: {e}")
            return False

    def delete_mistake(self, mistake_id: str) -> bool:
        """删除错题记录"""
        try:
            df = pd.read_csv(self.file_path)

            if mistake_id not in df['id'].values:
                return False

            # 删除行
            df = df[df['id'] != mistake_id]

            # 保存回CSV
            df.to_csv(self.file_path, index=False)

            safe_print(f"[OK] 删除了错题记录: {mistake_id}")
            return True
        except Exception as e:
            safe_print(f"[ERROR] 删除错题失败: {e}")
            return False

    def search_mistakes(self, keyword: str = None, tags: List[str] = None,
                        difficulty: DifficultyLevel = None) -> List[MistakeResponse]:
        """搜索错题记录"""
        try:
            df = pd.read_csv(self.file_path)

            if df.empty:
                return []

            # 应用筛选条件
            if keyword:
                mask = (df['question_content'].str.contains(keyword, case=False, na=False) |
                       df['wrong_process'].str.contains(keyword, case=False, na=False) |
                       df['notes'].str.contains(keyword, case=False, na=False))
                df = df[mask]

            if tags:
                mask = df['knowledge_tags'].apply(
                    lambda x: any(tag in str(x) for tag in tags)
                )
                df = df[mask]

            if difficulty:
                df = df[df['difficulty'] == difficulty.value]

            # 转换为响应对象
            mistakes = []
            for _, row in df.iterrows():
                mistake = self._row_to_mistake_response(row)
                if mistake:
                    mistakes.append(mistake)

            return mistakes
        except Exception as e:
            safe_print(f"[ERROR] 搜索错题失败: {e}")
            return []

    def get_statistics(self) -> Dict[str, Any]:
        """获取统计信息"""
        try:
            df = pd.read_csv(self.file_path)

            if df.empty:
                return {
                    "total_mistakes": 0,
                    "mistakes_by_type": {},
                    "mistakes_by_difficulty": {},
                    "top_knowledge_gaps": [],
                    "accuracy_trend": []
                }

            # 基础统计
            stats = {
                "total_mistakes": len(df),
                "mistakes_by_type": df['question_type'].value_counts().to_dict(),
                "mistakes_by_difficulty": df['difficulty'].value_counts().to_dict()
            }

            # 分析知识标签
            all_tags = []
            for tags in df['knowledge_tags']:
                if pd.notna(tags):
                    all_tags.extend([tag.strip() for tag in str(tags).split(',')])

            from collections import Counter
            tag_counts = Counter(all_tags)
            stats["top_knowledge_gaps"] = [tag for tag, _ in tag_counts.most_common(5)]

            # 简单正确率趋势（示例）
            stats["accuracy_trend"] = [0.7, 0.75, 0.8, 0.85, 0.9]  # 示例数据

            return stats
        except Exception as e:
            safe_print(f"[ERROR] 获取统计信息失败: {e}")
            return {}

    def _row_to_mistake_response(self, row) -> Optional[MistakeResponse]:
        """将CSV行转换为MistakeResponse对象"""
        try:
            # 解析知识标签
            tags_str = row.get('knowledge_tags', '')
            if pd.isna(tags_str):
                tags = []
            else:
                tags = [tag.strip() for tag in str(tags_str).split(',') if tag.strip()]

            return MistakeResponse(
                id=row['id'],
                question_content=row['question_content'],
                wrong_process=row['wrong_process'],
                wrong_answer=row['wrong_answer'],
                correct_answer=row['correct_answer'],
                question_type=QuestionType(row['question_type']),
                knowledge_tags=tags,
                difficulty=DifficultyLevel(row['difficulty']),
                source=row['source'] if pd.notna(row['source']) else None,
                notes=row['notes'] if pd.notna(row['notes']) else None,
                created_at=datetime.fromisoformat(row['created_at']),
                updated_at=datetime.fromisoformat(row['updated_at'])
            )
        except Exception as e:
            safe_print(f"[ERROR] 转换错题数据失败: {e}")
            return None