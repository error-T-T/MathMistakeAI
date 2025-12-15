"""
AI引擎模块（模拟版本）
作者: Rookie (error-T-T) & 艾可希雅
GitHub ID: error-T-T
学校邮箱: RookieT@e.gzhu.edu.cn
"""

import os
import json
import random
from typing import Dict, Any, Optional
from .data_models import AnalysisRequest, AnalysisResponse

class AIEngine:
    """AI引擎（模拟版本，真实环境需要连接Ollama）"""

    def __init__(self, base_url: str = None, model: str = None):
        """初始化AI引擎"""
        self.base_url = base_url or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.model = model or os.getenv("OLLAMA_MODEL", "qwen2.5:7b-instruct")
        self.is_connected = False
        self._test_connection()

    def _test_connection(self):
        """测试AI服务连接（模拟）"""
        try:
            # 模拟连接测试
            print(f"🤖 尝试连接AI服务: {self.base_url}")
            print(f"📚 使用模型: {self.model}")
            # 在实际实现中，这里会发送HTTP请求到Ollama
            self.is_connected = True
            print("✅ AI引擎初始化完成（模拟模式）")
        except Exception as e:
            print(f"❌ AI服务连接失败: {e}")
            print("⚠️  将使用模拟模式")
            self.is_connected = False

    def analyze_mistake(self, request: AnalysisRequest) -> AnalysisResponse:
        """分析错题（模拟版本）"""
        if not self.is_connected:
            print("⚠️  AI服务未连接，使用模拟分析")

        # 生成模拟分析结果
        error_types = [
            "概念理解错误", "计算过程错误", "公式记忆错误",
            "审题不仔细", "逻辑推理错误", "符号使用错误"
        ]

        root_causes = [
            "对基本概念理解不够深入",
            "计算过程中粗心大意",
            "相关公式记忆模糊",
            "题目条件理解不到位",
            "推理步骤存在逻辑漏洞",
            "数学符号使用不规范"
        ]

        knowledge_gaps_list = [
            ["定积分概念", "微积分基本定理"],
            ["导数计算规则", "链式法则"],
            ["三角函数公式", "诱导公式"],
            ["极限计算", "洛必达法则"],
            ["矩阵运算", "行列式计算"],
            ["微分方程求解", "分离变量法"]
        ]

        suggestions = [
            "建议复习相关基础概念，通过例题加深理解",
            "建议多做计算练习，提高计算准确性",
            "建议整理常用公式，定期复习记忆",
            "建议仔细审题，标记关键条件",
            "建议学习标准解题步骤，培养逻辑思维",
            "建议规范数学符号使用，避免混淆"
        ]

        examples = [
            "类似题目：计算∫(0 to π) sin x dx",
            "类似题目：求f(x)=x^2在x=1处的导数",
            "类似题目：计算lim(x→0) (1-cos x)/x^2",
            "类似题目：解方程dy/dx = 3x^2",
            "类似题目：求矩阵[[2,1],[1,2]]的特征值"
        ]

        # 随机选择（模拟AI分析）
        idx = random.randint(0, len(error_types) - 1)

        return AnalysisResponse(
            mistake_id=request.mistake_id,
            error_type=error_types[idx],
            root_cause=root_causes[idx],
            knowledge_gap=knowledge_gaps_list[idx],
            learning_suggestions=[suggestions[idx]],
            similar_examples=[random.choice(examples) for _ in range(3)],
            confidence_score=round(random.uniform(0.7, 0.95), 2)
        )

    def generate_practice_questions(self, knowledge_gaps: list, count: int = 5) -> list:
        """生成练习题（模拟版本）"""
        print(f"📝 为知识漏洞 {knowledge_gaps} 生成 {count} 道练习题")

        questions = []
        base_questions = [
            {
                "question": "计算定积分 ∫(0 to 1) x^3 dx",
                "answer": "1/4",
                "explanation": "使用幂函数积分公式 ∫x^n dx = x^(n+1)/(n+1)"
            },
            {
                "question": "求函数 f(x) = 2x^2 - 3x + 1 的导数",
                "answer": "f'(x) = 4x - 3",
                "explanation": "使用幂函数求导公式 (x^n)' = n*x^(n-1)"
            },
            {
                "question": "计算极限 lim(x→0) (e^x - 1)/x",
                "answer": "1",
                "explanation": "使用重要极限或洛必达法则"
            },
            {
                "question": "解微分方程 dy/dx = 2y",
                "answer": "y = Ce^(2x)",
                "explanation": "使用分离变量法，积分得到结果"
            },
            {
                "question": "计算矩阵 [[1,2],[3,4]] + [[5,6],[7,8]]",
                "answer": "[[6,8],[10,12]]",
                "explanation": "矩阵加法：对应元素相加"
            }
        ]

        for i in range(min(count, len(base_questions))):
            q = base_questions[i].copy()
            q["id"] = f"PQ{i+1:03d}"
            q["knowledge_tags"] = knowledge_gaps[:2] if knowledge_gaps else ["基础数学"]
            q["difficulty"] = random.choice(["简单", "中等", "困难"])
            questions.append(q)

        return questions

    def explain_concept(self, concept: str) -> Dict[str, Any]:
        """解释数学概念（模拟版本）"""
        print(f"📚 解释概念: {concept}")

        concept_explanations = {
            "定积分": {
                "definition": "定积分是函数在某个区间上的积分，表示曲线下的面积",
                "formula": "∫[a,b] f(x) dx = F(b) - F(a)",
                "key_points": ["微积分基本定理", "黎曼和", "面积计算"],
                "example": "∫(0 to 1) x^2 dx = 1/3"
            },
            "导数": {
                "definition": "导数描述函数在某一点的变化率",
                "formula": "f'(x) = lim(h→0) [f(x+h)-f(x)]/h",
                "key_points": ["切线斜率", "极值点", "单调性"],
                "example": "f(x)=x^2, f'(x)=2x"
            },
            "极限": {
                "definition": "极限描述函数在自变量趋近某值时的行为",
                "formula": "lim(x→a) f(x) = L",
                "key_points": ["连续性", "无穷小", "重要极限"],
                "example": "lim(x→0) sin(x)/x = 1"
            },
            "微分方程": {
                "definition": "微分方程是包含未知函数及其导数的方程",
                "formula": "F(x, y, y', ..., y^(n)) = 0",
                "key_points": ["阶数", "线性/非线性", "初值问题"],
                "example": "dy/dx = 2x, 解: y = x^2 + C"
            },
            "矩阵": {
                "definition": "矩阵是数字的矩形阵列",
                "formula": "A = [a_ij]_{m×n}",
                "key_points": ["行列式", "逆矩阵", "特征值"],
                "example": "[[1,2],[3,4]] 是2×2矩阵"
            }
        }

        if concept in concept_explanations:
            return concept_explanations[concept]
        else:
            return {
                "definition": f"{concept}是数学中的重要概念",
                "formula": "暂无标准公式",
                "key_points": ["基本定义", "相关性质", "应用场景"],
                "example": "示例暂缺",
                "note": "这是模拟数据，实际使用需要AI模型生成"
            }

    def health_check(self) -> Dict[str, Any]:
        """AI引擎健康检查"""
        return {
            "service": "AI Engine (Mock)",
            "status": "healthy" if self.is_connected else "degraded",
            "model": self.model,
            "base_url": self.base_url,
            "mode": "mock" if not self.is_connected else "connected",
            "message": "模拟模式运行中，实际环境请连接Ollama" if not self.is_connected else "已连接AI服务"
        }