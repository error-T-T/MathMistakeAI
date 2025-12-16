# -*- coding: utf-8 -*-
import re
from typing import Dict, Any, List

class FeatureExtractor:
    """
    NLP Feature Extractor for Math Questions
    """
    
    def __init__(self):
        # Basic math keywords mapping
        # Use unicode escape sequences to avoid encoding issues
        self.keywords = {
            "calculation": ["\u8ba1\u7b97", "\u6c42", "\u89e3", "\u5316\u7b80", "\u503c"], # calculation, find, solve, simplify, value
            "proof": ["\u8bc1\u660e", "\u8bc1", "show that", "prove"], # proof, prove
            "concept": ["\u5b9a\u4e49", "\u6027\u8d28", "\u6982\u5ff5", "\u53d9\u8ff0"], # definition, property, concept, statement
            "application": ["\u5e94\u7528", "\u5b9e\u9645", "\u6a21\u578b"] # application, practical, model
        }
        
        # Difficulty indicators
        self.difficulty_indicators = {
            "high": ["\u7efc\u5408", "\u8bc1\u660e", "\u8ba8\u8bba", "\u5b58\u5728\u6027"], # comprehensive, proof, discuss, existence
            "medium": ["\u5e94\u7528", "\u6c42\u89e3", "\u8ba1\u7b97"], # application, solve, calculation
            "low": ["\u76f4\u63a5", "\u57fa\u7840", "\u6982\u5ff5"] # direct, basic, concept
        }

    def extract_features(self, text: str) -> Dict[str, Any]:
        """
        Extract features from text
        """
        if not text:
            return self._get_empty_features()

        features = {
            "length": len(text),
            "formula_count": self._count_formulas(text),
            "question_type": self._classify_question_type(text),
            "estimated_difficulty": self._estimate_difficulty(text),
            "symbol_density": self._calculate_symbol_density(text),
            "has_latex": self._has_latex(text)
        }
        
        return features

    def _get_empty_features(self) -> Dict[str, Any]:
        return {
            "length": 0,
            "formula_count": 0,
            "question_type": "unknown",
            "estimated_difficulty": "unknown",
            "symbol_density": 0.0,
            "has_latex": False
        }

    def _count_formulas(self, text: str) -> int:
        """Count LaTeX formulas"""
        # Match $...$ and $$...$$
        inline_formulas = len(re.findall(r'\$[^$]+\$', text))
        block_formulas = len(re.findall(r'\$\$[^$]+\$\$', text))
        # Simple \[ \] and \( \) matching
        latex_brackets = len(re.findall(r'\\\[.*?\\\]', text)) + len(re.findall(r'\\\(.*?\\\)', text))
        return inline_formulas + block_formulas + latex_brackets

    def _has_latex(self, text: str) -> bool:
        return self._count_formulas(text) > 0

    def _classify_question_type(self, text: str) -> str:
        """Classify question type based on keywords"""
        text_lower = text.lower()
        
        scores = {k: 0 for k in self.keywords}
        
        for cat, words in self.keywords.items():
            for word in words:
                if word in text_lower:
                    scores[cat] += 1
        
        # Return the type with the highest score, default to calculation
        best_type = max(scores, key=scores.get)
        if scores[best_type] == 0:
            return "calculation"
        return best_type

    def _calculate_symbol_density(self, text: str) -> float:
        """Calculate math symbol density"""
        if not text:
            return 0.0
            
        # Common math symbols and Greek letters
        # Use ASCII symbols only to avoid encoding issues, plus some common ones if safe
        math_symbols = set("+-*/=<>")
        # Add more symbols if needed, but be careful with encoding
        
        symbol_count = sum(1 for char in text if char in math_symbols or char in "$^_{}\\")
        
        return round(symbol_count / len(text), 4)

    def _estimate_difficulty(self, text: str) -> str:
        """
        Estimate difficulty
        Rules:
        1. More formulas -> Harder
        2. Longer text -> Harder
        3. Specific keywords
        """
        score = 0
        
        # Length factor
        if len(text) > 200: score += 1
        if len(text) > 500: score += 1
        
        # Formula factor
        formulas = self._count_formulas(text)
        if formulas > 2: score += 1
        if formulas > 5: score += 2
        
        # Keyword factor
        for level, words in self.difficulty_indicators.items():
            for word in words:
                if word in text:
                    if level == "high": score += 2
                    elif level == "medium": score += 1
                    
        if score >= 4:
            return "hard"
        elif score >= 2:
            return "medium"
        else:
            return "easy"
