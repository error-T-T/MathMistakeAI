# -*- coding: utf-8 -*-
import pytest
from unittest.mock import MagicMock, patch
from backend.ai_engine import AIEngine
from backend.data_models import AnalysisRequest

def test_ai_engine_initialization():
    engine = AIEngine()
    assert engine is not None
    assert engine.prompt_manager is not None

def test_generate_explanation_fallback():
    engine = AIEngine()
    engine.fallback_mode = True
    explanation = engine.generate_explanation("1+1=?")
    assert "Mock Explanation" in explanation

def test_generate_solution_summary_fallback():
    engine = AIEngine()
    engine.fallback_mode = True
    summary = engine.generate_solution_summary("Calculus", "Derivatives")
    assert "Mock Summary" in summary

@patch("backend.ai_engine.AIEngine._call_ollama")
def test_generate_explanation_call(mock_call):
    engine = AIEngine()
    engine.fallback_mode = False
    engine.is_connected = True
    
    mock_call.return_value = "Step 1: ..."
    
    explanation = engine.generate_explanation("Solve x^2=4")
    
    assert explanation == "Step 1: ..."
    mock_call.assert_called_once()
    
    # Verify prompt was rendered (we can check args passed to _call_ollama)
    args, _ = mock_call.call_args
    system_prompt, user_prompt = args[0], args[1]
    assert "Solve x^2=4" in user_prompt
    assert "Solution Strategy" in user_prompt  # Part of the template

@patch("backend.ai_engine.AIEngine._call_ollama")
def test_generate_solution_summary_call(mock_call):
    engine = AIEngine()
    engine.fallback_mode = False
    engine.is_connected = True
    
    mock_call.return_value = "Core Method: ..."
    
    summary = engine.generate_solution_summary("Integration", "By Parts")
    
    assert summary == "Core Method: ..."
    mock_call.assert_called_once()
    
    args, _ = mock_call.call_args
    _, user_prompt = args[0], args[1]
    assert "Integration" in user_prompt
    assert "By Parts" in user_prompt
