"""
AI引擎模块（真实Ollama集成版本）
作者: Rookie (error-T-T) & 艾可希雅
GitHub ID: error-T-T
学校邮箱: RookieT@e.gzhu.edu.cn
"""

import os
import json
import random
import httpx
from typing import Dict, Any, Optional
from .data_models import AnalysisRequest, AnalysisResponse

class AIEngine:
    """AI引擎（真实Ollama集成版本）"""

    def __init__(self, base_url: str = None, model: str = None):
        """初始化AI引擎"""
        self.base_url = base_url or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.model = model or os.getenv("OLLAMA_MODEL", "qwen2.5:7b")
        self.is_connected = False
        self.client = httpx.Client(timeout=30.0)  # 30秒超时
        self.fallback_mode = False  # 是否启用模拟回退
        self._test_connection()

    def _test_connection(self):
        """测试AI服务连接（真实连接测试）"""
        try:
            print(f"🤖 尝试连接AI服务: {self.base_url}")
            print(f"📚 使用模型: {self.model}")

            # 测试Ollama API连接
            response = self.client.get(f"{self.base_url}/api/tags", timeout=5.0)
            if response.status_code == 200:
                models = response.json().get("models", [])
                model_names = [m["name"] for m in models]

                if self.model in model_names:
                    self.is_connected = True
                    self.fallback_mode = False
                    print(f"✅ AI引擎初始化完成 - 已连接到模型: {self.model}")
                else:
                    print(f"⚠️  模型 {self.model} 未找到，可用模型: {model_names}")
                    print("⚠️  将使用模拟模式")
                    self.is_connected = False
                    self.fallback_mode = True
            else:
                print(f"❌ Ollama服务响应异常: {response.status_code}")
                print("⚠️  将使用模拟模式")
                self.is_connected = False
                self.fallback_mode = True

        except Exception as e:
            print(f"❌ AI服务连接失败: {e}")
            print("⚠️  将使用模拟模式")
            self.is_connected = False
            self.fallback_mode = True

    def _generate_mock_analysis(self, request: AnalysisRequest) -> AnalysisResponse:
        """生成模拟分析结果（回退用）"""
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

    def analyze_mistake(self, request: AnalysisRequest) -> AnalysisResponse:
        """分析错题（真实AI分析）"""
        if self.fallback_mode or not self.is_connected:
            print("⚠️  AI服务未连接，使用模拟分析")
            return self._generate_mock_analysis(request)

        try:
            # 构造系统提示词
            system_prompt = """你是一个专业的数学教育AI助手，专门分析学生的数学错题。
请根据提供的错题信息，生成详细的分析报告，必须严格按照以下JSON格式返回：

{
    "error_type": "错误类型分类（如：概念理解错误、计算过程错误等）",
    "root_cause": "错误根源分析",
    "knowledge_gap": ["知识漏洞1", "知识漏洞2"],
    "learning_suggestions": ["学习建议1", "学习建议2"],
    "similar_examples": ["类似题目示例1", "类似题目示例2"],
    "confidence_score": 0.85
}

请确保confidence_score在0.7-0.95之间，表示分析的置信度。"""

            # 构造用户消息
            user_message = f"""请分析以下数学错题：

题目内容: {request.question_content}
错误过程: {request.wrong_process}
错误答案: {request.wrong_answer}
正确答案: {request.correct_answer}

请严格按照上述JSON格式返回分析结果。"""

            # 构造Ollama API请求
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                "stream": False,
                "format": "json",  # 要求返回JSON格式
                "options": {
                    "temperature": 0.3,  # 较低温度以获得更确定性的输出
                    "top_p": 0.9
                }
            }

            print(f"📊 发送AI分析请求，错题ID: {request.mistake_id}")

            # 发送请求到Ollama
            response = self.client.post(
                f"{self.base_url}/api/chat",
                json=payload,
                timeout=60.0  # 分析可能需要较长时间
            )

            if response.status_code == 200:
                result = response.json()
                content = result.get("message", {}).get("content", "")

                # 尝试解析JSON响应
                try:
                    # 有时模型会在JSON前后添加额外文本，需要提取JSON部分
                    if "```json" in content:
                        # 提取代码块中的JSON
                        start_idx = content.find("```json") + 7
                        end_idx = content.find("```", start_idx)
                        json_str = content[start_idx:end_idx].strip()
                    elif "```" in content:
                        # 提取普通代码块
                        start_idx = content.find("```") + 3
                        end_idx = content.find("```", start_idx)
                        json_str = content[start_idx:end_idx].strip()
                    else:
                        # 直接尝试解析整个内容
                        json_str = content.strip()

                    analysis_data = json.loads(json_str)

                    # 构建AnalysisResponse对象
                    return AnalysisResponse(
                        mistake_id=request.mistake_id,
                        error_type=analysis_data.get("error_type", "未知错误类型"),
                        root_cause=analysis_data.get("root_cause", "未知错误根源"),
                        knowledge_gap=analysis_data.get("knowledge_gap", []),
                        learning_suggestions=analysis_data.get("learning_suggestions", []),
                        similar_examples=analysis_data.get("similar_examples", []),
                        confidence_score=min(max(analysis_data.get("confidence_score", 0.8), 0.7), 0.95)
                    )

                except json.JSONDecodeError as e:
                    print(f"❌ JSON解析失败: {e}")
                    print(f"📝 原始响应: {content[:200]}...")
                    print("⚠️  使用模拟分析作为回退")
                    return self._generate_mock_analysis(request)

            else:
                print(f"❌ Ollama API请求失败: {response.status_code}")
                print(f"📝 响应: {response.text}")
                print("⚠️  使用模拟分析作为回退")
                return self._generate_mock_analysis(request)

        except Exception as e:
            print(f"❌ AI分析过程中发生异常: {e}")
            print("⚠️  使用模拟分析作为回退")
            return self._generate_mock_analysis(request)

    def generate_practice_questions(self, knowledge_gaps: list, count: int = 5) -> list:
        """生成练习题（真实AI生成）"""
        print(f"📝 为知识漏洞 {knowledge_gaps} 生成 {count} 道练习题")

        if self.fallback_mode or not self.is_connected:
            print("⚠️  AI服务未连接，使用模拟数据")
            return self._generate_mock_practice_questions(knowledge_gaps, count)

        try:
            # 构造提示词
            system_prompt = "你是一个专业的数学教师，请根据给定的知识漏洞生成练习题。"

            user_message = f"""请为以下知识漏洞生成{count}道数学练习题：
知识漏洞: {', '.join(knowledge_gaps)}

请返回一个JSON数组，每个练习题对象包含以下字段：
{{
    "question": "题目内容",
    "answer": "正确答案",
    "explanation": "解题思路和解释",
    "difficulty": "简单/中等/困难"
}}"""

            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                "stream": False,
                "format": "json"
            }

            response = self.client.post(
                f"{self.base_url}/api/chat",
                json=payload,
                timeout=60.0
            )

            if response.status_code == 200:
                result = response.json()
                content = result.get("message", {}).get("content", "")

                try:
                    # 提取和解析JSON
                    json_str = content
                    if "```json" in content:
                        start_idx = content.find("```json") + 7
                        end_idx = content.find("```", start_idx)
                        json_str = content[start_idx:end_idx].strip()
                    elif "```" in content:
                        start_idx = content.find("```") + 3
                        end_idx = content.find("```", start_idx)
                        json_str = content[start_idx:end_idx].strip()

                    questions = json.loads(json_str)

                    # 添加ID和标签
                    for i, q in enumerate(questions):
                        q["id"] = f"PQ{i+1:03d}"
                        q["knowledge_tags"] = knowledge_gaps

                    return questions

                except json.JSONDecodeError:
                    print("❌ 练习题JSON解析失败，使用模拟数据")
                    return self._generate_mock_practice_questions(knowledge_gaps, count)

            else:
                print(f"❌ 生成练习题失败: {response.status_code}")
                return self._generate_mock_practice_questions(knowledge_gaps, count)

        except Exception as e:
            print(f"❌ 生成练习题异常: {e}")
            return self._generate_mock_practice_questions(knowledge_gaps, count)

    def _generate_mock_practice_questions(self, knowledge_gaps: list, count: int = 5) -> list:
        """生成模拟练习题（回退用）"""
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

        questions = []
        for i in range(min(count, len(base_questions))):
            q = base_questions[i].copy()
            q["id"] = f"PQ{i+1:03d}"
            q["knowledge_tags"] = knowledge_gaps[:2] if knowledge_gaps else ["基础数学"]
            q["difficulty"] = random.choice(["简单", "中等", "困难"])
            questions.append(q)

        return questions

    def explain_concept(self, concept: str) -> Dict[str, Any]:
        """解释数学概念（真实AI解释）"""
        print(f"📚 解释概念: {concept}")

        if self.fallback_mode or not self.is_connected:
            print("⚠️  AI服务未连接，使用模拟数据")
            return self._generate_mock_concept_explanation(concept)

        try:
            system_prompt = "你是一个专业的数学教师，请清晰解释数学概念。"

            user_message = f"""请解释数学概念：{concept}

请返回JSON格式：
{{
    "definition": "概念定义",
    "formula": "相关公式（如果有）",
    "key_points": ["关键点1", "关键点2", "关键点3"],
    "example": "示例",
    "note": "备注"
}}"""

            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                "stream": False,
                "format": "json"
            }

            response = self.client.post(
                f"{self.base_url}/api/chat",
                json=payload,
                timeout=30.0
            )

            if response.status_code == 200:
                result = response.json()
                content = result.get("message", {}).get("content", "")

                try:
                    json_str = content
                    if "```json" in content:
                        start_idx = content.find("```json") + 7
                        end_idx = content.find("```", start_idx)
                        json_str = content[start_idx:end_idx].strip()
                    elif "```" in content:
                        start_idx = content.find("```") + 3
                        end_idx = content.find("```", start_idx)
                        json_str = content[start_idx:end_idx].strip()

                    explanation = json.loads(json_str)
                    explanation["concept"] = concept
                    return explanation

                except json.JSONDecodeError:
                    print("❌ 概念解释JSON解析失败，使用模拟数据")
                    return self._generate_mock_concept_explanation(concept)

            else:
                print(f"❌ 解释概念失败: {response.status_code}")
                return self._generate_mock_concept_explanation(concept)

        except Exception as e:
            print(f"❌ 解释概念异常: {e}")
            return self._generate_mock_concept_explanation(concept)

    def _generate_mock_concept_explanation(self, concept: str) -> Dict[str, Any]:
        """生成模拟概念解释（回退用）"""
        concept_explanations = {
            "定积分": {
                "definition": "定积分是函数在某个区间上的积分，表示曲线下的面积",
                "formula": "∫[a,b] f(x) dx = F(b) - F(a)",
                "key_points": ["微积分基本定理", "黎曼和", "面积计算"],
                "example": "∫(0 to 1) x^2 dx = 1/3",
                "note": "这是模拟数据"
            },
            "导数": {
                "definition": "导数描述函数在某一点的变化率",
                "formula": "f'(x) = lim(h→0) [f(x+h)-f(x)]/h",
                "key_points": ["切线斜率", "极值点", "单调性"],
                "example": "f(x)=x^2, f'(x)=2x",
                "note": "这是模拟数据"
            },
            "极限": {
                "definition": "极限描述函数在自变量趋近某值时的行为",
                "formula": "lim(x→a) f(x) = L",
                "key_points": ["连续性", "无穷小", "重要极限"],
                "example": "lim(x→0) sin(x)/x = 1",
                "note": "这是模拟数据"
            }
        }

        if concept in concept_explanations:
            explanation = concept_explanations[concept].copy()
            explanation["concept"] = concept
            return explanation
        else:
            return {
                "concept": concept,
                "definition": f"{concept}是数学中的重要概念",
                "formula": "暂无标准公式",
                "key_points": ["基本定义", "相关性质", "应用场景"],
                "example": "示例暂缺",
                "note": "这是模拟数据，实际使用需要AI模型生成"
            }

    def health_check(self) -> Dict[str, Any]:
        """AI引擎健康检查"""
        return {
            "service": "MathMistakeAI AI Engine",
            "status": "healthy" if self.is_connected else "degraded",
            "model": self.model,
            "base_url": self.base_url,
            "connected": self.is_connected,
            "mode": "real" if self.is_connected and not self.fallback_mode else "mock",
            "message": "已连接到真实AI服务" if self.is_connected and not self.fallback_mode else "模拟模式运行中"
        }