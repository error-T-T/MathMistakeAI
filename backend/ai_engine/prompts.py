# -*- coding: utf-8 -*-
from typing import Dict, Any, Optional
from string import Template

class PromptManager:
    """
    Prompt Template Manager
    Manages and renders AI prompt templates
    """
    
    # Mistake Analysis Template
    MISTAKE_ANALYSIS = """
You are an experienced university math tutor. Please analyze the following student mistake:

[Question Content]
${question_content}

[Student Wrong Answer]
${wrong_answer}

[Student Wrong Process]
${wrong_process}

[Correct Answer]
${correct_answer}

Please provide the analysis result in the following JSON format (do not include Markdown code block markers):
{
    "error_type": "Error Type (e.g., Calculation Error, Concept Confusion, etc.)",
    "root_cause": "Root Cause Analysis (Concise)",
    "knowledge_gap": ["Knowledge Point 1", "Knowledge Point 2"],
    "learning_suggestions": ["Suggestion 1", "Suggestion 2"],
    "similar_examples": ["Similar Example 1 (Question only)", "Similar Example 2 (Question only)"],
    "confidence_score": 0.95
}
"""

    # Similar Question Generation Template
    SIMILAR_QUESTION_GENERATION = """
Please generate ${count} similar practice questions based on the following question.

[Original Question]
${question_content}

[Knowledge Points]
${knowledge_tags}

[Difficulty]
${difficulty}

[Similarity Level]
${similarity_level} (high: variant/value change, medium: same type, low: cross-knowledge synthesis)

Please return the following JSON list (do not include Markdown code block markers):
[
    {
        "question_content": "Question Content (Support LaTeX)",
        "options": ["Option A", "Option B", "Option C", "Option D"] (If multiple choice),
        "correct_answer": "Correct Answer",
        "explanation": "Brief Explanation"
    }
]
"""

    # Explanation Generation Template
    EXPLANATION_GENERATION = """
Please provide a detailed step-by-step explanation for the following math question:

[Question]
${question_content}

Please output in the following structure:
1. **Solution Strategy**: Analyze the question points and strategy.
2. **Detailed Steps**: Provide derivation steps, use LaTeX for key formulas.
3. **Summary**: Review key points and common pitfalls.
"""

    def __init__(self):
        self.templates: Dict[str, Template] = {
            "mistake_analysis": Template(self.MISTAKE_ANALYSIS),
            "similar_question_generation": Template(self.SIMILAR_QUESTION_GENERATION),
            "explanation_generation": Template(self.EXPLANATION_GENERATION)
        }

    def render(self, template_name: str, **kwargs) -> str:
        """
        Render specified template
        :param template_name: Template name
        :param kwargs: Template variables
        :return: Rendered prompt
        :raises ValueError: If template does not exist or variables are missing
        """
        if template_name not in self.templates:
            raise ValueError(f"Template '{template_name}' does not exist. Available templates: {list(self.templates.keys())}")
        
        try:
            return self.templates[template_name].substitute(**kwargs)
        except KeyError as e:
            raise ValueError(f"Template render failed: Missing variable {e}")

    def get_template_names(self) -> list:
        """Get all available template names"""
        return list(self.templates.keys())
