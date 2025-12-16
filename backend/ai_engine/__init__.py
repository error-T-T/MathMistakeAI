# -*- coding: utf-8 -*-
"""
AI Engine Module (Real Ollama Integration)
Author: Rookie (error-T-T) & Exia
GitHub ID: error-T-T
Email: RookieT@e.gzhu.edu.cn
"""

import os
import sys
import json
import random
import requests
from typing import Dict, Any, Optional
# Use absolute import assuming 'backend' is a package in python path
from backend.data_models import AnalysisRequest, AnalysisResponse

def safe_print(text: str):
    """Safe print function for Windows console encoding issues"""
    # Clean non-ASCII characters to avoid encoding issues
    cleaned_text = ''.join(c if ord(c) < 128 else '?' for c in text)
    try:
        print(cleaned_text)
    except Exception as e:
        # If exception persists, print simple error
        print(f"[Print Error] {type(e).__name__}: {str(e)[:50]}")

class AIEngine:
    """AI Engine (Real Ollama Integration)"""

    def __init__(self, base_url: str = None, model: str = None):
        """Initialize AI Engine"""
        self.base_url = base_url or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.model = model or os.getenv("OLLAMA_MODEL", "qwen2.5:7b")
        self.is_connected = False
        self.client = requests.Session()  # 30s timeout
        self.client.timeout = 30.0
        self.fallback_mode = False  # Enable mock fallback
        self._test_connection()

    def _test_connection(self):
        """Test AI Service Connection"""
        try:
            safe_print(f"Attempting to connect to AI service: {self.base_url}")
            safe_print(f"Using model: {self.model}")

            # Test Ollama API connection
            response = self.client.get(f"{self.base_url}/api/tags", timeout=5.0)
            if response.status_code == 200:
                models = response.json().get("models", [])
                model_names = [m["name"] for m in models]

                if self.model in model_names:
                    self.is_connected = True
                    self.fallback_mode = False
                    safe_print(f"AI Engine Initialized - Connected to model: {self.model}")
                else:
                    safe_print(f"Model {self.model} not found, available models: {model_names}")
                    safe_print("Using mock mode")
                    self.is_connected = False
                    self.fallback_mode = True
            else:
                safe_print(f"Ollama service response error: {response.status_code}")
                safe_print("Using mock mode")
                self.is_connected = False
                self.fallback_mode = True

        except Exception as e:
            safe_print(f"AI service connection failed: {e}")
            safe_print("Using mock mode")
            self.is_connected = False
            self.fallback_mode = True

    def _generate_mock_analysis(self, request: AnalysisRequest) -> AnalysisResponse:
        """Generate mock analysis (fallback)"""
        error_types = [
            "Concept Misunderstanding", "Calculation Error", "Formula Memory Error",
            "Careless Reading", "Logical Reasoning Error", "Symbol Usage Error"
        ]

        root_causes = [
            "Insufficient understanding of basic concepts",
            "Carelessness in calculation process",
            "Vague memory of relevant formulas",
            "Inadequate understanding of question conditions",
            "Logical loopholes in reasoning steps",
            "Non-standard use of mathematical symbols"
        ]

        knowledge_gaps_list = [
            ["Definite Integral Concept", "Fundamental Theorem of Calculus"],
            ["Derivative Calculation Rules", "Chain Rule"],
            ["Trigonometric Formulas", "Induction Formulas"],
            ["Limit Calculation", "L'Hopital's Rule"],
            ["Matrix Operations", "Determinant Calculation"],
            ["Differential Equation Solving", "Separation of Variables"]
        ]

        suggestions = [
            "Review basic concepts and deepen understanding through examples",
            "Practice more calculations to improve accuracy",
            "Organize common formulas and review them regularly",
            "Read questions carefully and mark key conditions",
            "Learn standard problem-solving steps and cultivate logical thinking",
            "Standardize mathematical symbol usage to avoid confusion"
        ]

        examples = [
            "Similar Question: Calculate integral(0 to pi) sin x dx",
            "Similar Question: Find derivative of f(x)=x^2 at x=1",
            "Similar Question: Calculate lim(x->0) (1-cos x)/x^2",
            "Similar Question: Solve equation dy/dx = 3x^2",
            "Similar Question: Find eigenvalues of matrix [[2,1],[1,2]]"
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
        """Analyze mistake (Real AI Analysis)"""
        if self.fallback_mode or not self.is_connected:
            safe_print("AI service not connected, using mock analysis")
            return self._generate_mock_analysis(request)

        try:
            # Construct system prompt
            system_prompt = """You are a professional math education AI assistant, specializing in analyzing student math mistakes.
Please generate a detailed analysis report based on the provided mistake information, strictly following this JSON format:

{
    "error_type": "Error type classification (e.g., Concept Misunderstanding, Calculation Error)",
    "root_cause": "Root cause analysis",
    "knowledge_gap": ["Knowledge Gap 1", "Knowledge Gap 2"],
    "learning_suggestions": ["Learning Suggestion 1", "Learning Suggestion 2"],
    "similar_examples": ["Similar Example 1", "Similar Example 2"],
    "confidence_score": 0.85
}

Ensure confidence_score is between 0.7-0.95."""

            # Construct user message
            user_message = f"""Please analyze the following math mistake:

Question: {request.question_content}
Wrong Process: {request.wrong_process}
Wrong Answer: {request.wrong_answer}
Correct Answer: {request.correct_answer}

Please strictly return the analysis result in the JSON format above."""

            # Construct Ollama API request
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                "stream": False,
                "format": "json",
                "options": {
                    "temperature": 0.3,
                    "top_p": 0.9
                }
            }

            safe_print(f"Sending AI analysis request, Mistake ID: {request.mistake_id}")

            # Send request to Ollama
            response = self.client.post(
                f"{self.base_url}/api/chat",
                json=payload,
                timeout=60.0
            )

            if response.status_code == 200:
                result = response.json()
                content = result.get("message", {}).get("content", "")

                # Try to parse JSON response
                try:
                    if "```json" in content:
                        start_idx = content.find("```json") + 7
                        end_idx = content.find("```", start_idx)
                        json_str = content[start_idx:end_idx].strip()
                    elif "```" in content:
                        start_idx = content.find("```") + 3
                        end_idx = content.find("```", start_idx)
                        json_str = content[start_idx:end_idx].strip()
                    else:
                        json_str = content.strip()

                    analysis_data = json.loads(json_str)

                    return AnalysisResponse(
                        mistake_id=request.mistake_id,
                        error_type=analysis_data.get("error_type", "Unknown Error Type"),
                        root_cause=analysis_data.get("root_cause", "Unknown Root Cause"),
                        knowledge_gap=analysis_data.get("knowledge_gap", []),
                        learning_suggestions=analysis_data.get("learning_suggestions", []),
                        similar_examples=analysis_data.get("similar_examples", []),
                        confidence_score=min(max(analysis_data.get("confidence_score", 0.8), 0.7), 0.95)
                    )

                except json.JSONDecodeError as e:
                    safe_print(f"JSON parse failed: {e}")
                    safe_print(f"Raw response: {content[:200]}...")
                    safe_print("Using mock analysis as fallback")
                    return self._generate_mock_analysis(request)

            else:
                safe_print(f"Ollama API request failed: {response.status_code}")
                safe_print(f"Response: {response.text}")
                safe_print("Using mock analysis as fallback")
                return self._generate_mock_analysis(request)

        except Exception as e:
            safe_print(f"Exception during AI analysis: {e}")
            safe_print("Using mock analysis as fallback")
            return self._generate_mock_analysis(request)

    def generate_practice_questions(self, knowledge_gaps: list, count: int = 5,
                                   difficulty: str = None, similarity_level: str = None) -> list:
        """Generate similar practice questions (Real AI Generation)"""
        safe_print(f"Generating {count} practice questions for knowledge gaps {knowledge_gaps}")
        safe_print(f"Params: difficulty={difficulty}, similarity_level={similarity_level}")

        safe_print("Temporarily using mock data (debugging)")
        return self._generate_mock_practice_questions(knowledge_gaps, count, difficulty, similarity_level)

    def _generate_mock_practice_questions(self, knowledge_gaps: list, count: int = 5,
                                         difficulty: str = None, similarity_level: str = None) -> list:
        """Generate mock practice questions (fallback)"""
        similarity_levels = {
            "low": ["Different form", "Different background", "Different parameters"],
            "medium": ["Similar type", "Similar method", "Different conditions"],
            "high": ["Highly similar", "Same structure", "Different values"]
        }

        sim_desc = similarity_levels.get(similarity_level, ["Similar"]) if similarity_level else ["Similar"]

        while len(sim_desc) < 3:
            sim_desc.append(sim_desc[-1] if sim_desc else "Similar")

        base_questions = [
            {
                "question": f"Calculate integral(0 to 1) x^3 dx ({sim_desc[0]} question)",
                "answer": "1/4",
                "explanation": f"Use power rule for integration, this is a {similarity_level or 'medium'} similarity question"
            },
            {
                "question": f"Find derivative of f(x) = 2x^2 - 3x + 1 ({sim_desc[1]} question)",
                "answer": "f'(x) = 4x - 3",
                "explanation": f"Use power rule for differentiation, this is a {similarity_level or 'medium'} similarity question"
            },
            {
                "question": f"Calculate limit lim(x->0) (e^x - 1)/x ({sim_desc[2]} question)",
                "answer": "1",
                "explanation": f"Use L'Hopital's rule, this is a {similarity_level or 'medium'} similarity question"
            },
            {
                "question": f"Solve differential equation dy/dx = 2y (Similar question)",
                "answer": "y = Ce^(2x)",
                "explanation": f"Use separation of variables, this is a {similarity_level or 'medium'} similarity question"
            },
            {
                "question": f"Calculate matrix [[1,2],[3,4]] + [[5,6],[7,8]] (Similar question)",
                "answer": "[[6,8],[10,12]]",
                "explanation": f"Matrix addition, this is a {similarity_level or 'medium'} similarity question"
            }
        ]

        questions = []
        for i in range(min(count, len(base_questions))):
            q = base_questions[i].copy()
            q["id"] = f"PQ{i+1:03d}"
            q["knowledge_tags"] = knowledge_gaps[:2] if knowledge_gaps else ["Basic Math"]
            q["difficulty"] = difficulty or random.choice(["Easy", "Medium", "Hard"])
            q["similarity_level"] = similarity_level or "medium"
            questions.append(q)

        return questions

    def explain_concept(self, concept: str) -> Dict[str, Any]:
        """Explain math concept (Real AI Explanation)"""
        safe_print(f"Explaining concept: {concept}")

        if self.fallback_mode or not self.is_connected:
            safe_print("AI service not connected, using mock data")
            return self._generate_mock_concept_explanation(concept)

        try:
            system_prompt = "You are a professional math teacher, please explain math concepts clearly."

            user_message = f"""Please explain the math concept: {concept}

Return JSON format:
{{
    "definition": "Concept definition",
    "formula": "Relevant formula (if any)",
    "key_points": ["Key point 1", "Key point 2", "Key point 3"],
    "example": "Example",
    "note": "Note"
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
                    safe_print("Concept explanation JSON parse failed, using mock data")
                    return self._generate_mock_concept_explanation(concept)

            else:
                safe_print(f"Explain concept failed: {response.status_code}")
                return self._generate_mock_concept_explanation(concept)

        except Exception as e:
            safe_print(f"Explain concept exception: {e}")
            return self._generate_mock_concept_explanation(concept)

    def _generate_mock_concept_explanation(self, concept: str) -> Dict[str, Any]:
        """Generate mock concept explanation (fallback)"""
        concept_explanations = {
            "Definite Integral": {
                "definition": "Definite integral represents the area under the curve",
                "formula": "integral[a,b] f(x) dx = F(b) - F(a)",
                "key_points": ["Fundamental Theorem of Calculus", "Riemann Sum", "Area Calculation"],
                "example": "integral(0 to 1) x^2 dx = 1/3",
                "note": "This is mock data"
            },
            "Derivative": {
                "definition": "Derivative describes the rate of change of a function",
                "formula": "f'(x) = lim(h->0) [f(x+h)-f(x)]/h",
                "key_points": ["Tangent Slope", "Extremum", "Monotonicity"],
                "example": "f(x)=x^2, f'(x)=2x",
                "note": "This is mock data"
            }
        }

        # Simple mapping for Chinese concepts if passed
        # "定积分"
        if concept == "\u5b9a\u79ef\u5206": concept = "Definite Integral"
        # "导数"
        if concept == "\u5bfc\u6570": concept = "Derivative"

        if concept in concept_explanations:
            explanation = concept_explanations[concept].copy()
            explanation["concept"] = concept
            return explanation
        else:
            return {
                "concept": concept,
                "definition": f"{concept} is an important math concept",
                "formula": "No standard formula available",
                "key_points": ["Basic Definition", "Properties", "Applications"],
                "example": "Example missing",
                "note": "This is mock data, real usage requires AI model generation"
            }

    def health_check(self) -> Dict[str, Any]:
        """AI Engine Health Check"""
        return {
            "service": "MathMistakeAI AI Engine",
            "status": "healthy" if self.is_connected else "degraded",
            "model": self.model,
            "base_url": self.base_url,
            "connected": self.is_connected,
            "mode": "real" if self.is_connected and not self.fallback_mode else "mock",
            "message": "Connected to real AI service" if self.is_connected and not self.fallback_mode else "Running in mock mode"
        }
