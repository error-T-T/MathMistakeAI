# -*- coding: utf-8 -*-
import pytest
from backend.ai_engine.prompts import PromptManager

def test_prompt_manager_initialization():
    manager = PromptManager()
    assert manager is not None
    assert "mistake_analysis" in manager.get_template_names()

def test_render_mistake_analysis():
    manager = PromptManager()
    prompt = manager.render(
        "mistake_analysis",
        question_content="1+1=?",
        wrong_answer="3",
        wrong_process="Guessing",
        correct_answer="2"
    )
    assert "1+1=?" in prompt
    assert "Guessing" in prompt

def test_render_missing_variable():
    manager = PromptManager()
    with pytest.raises(ValueError) as excinfo:
        manager.render("mistake_analysis", question_content="1+1=?")
    # "Missing variable"
    assert "Missing variable" in str(excinfo.value)

def test_render_unknown_template():
    manager = PromptManager()
    with pytest.raises(ValueError) as excinfo:
        manager.render("unknown_template")
    # "does not exist"
    assert "does not exist" in str(excinfo.value)

def test_render_similar_question_generation():
    manager = PromptManager()
    prompt = manager.render(
        "similar_question_generation",
        count=3,
        question_content="x^2 = 4",
        knowledge_tags="Algebra",
        difficulty="Easy",
        similarity_level="medium"
    )
    assert "x^2 = 4" in prompt
    assert "Algebra" in prompt
