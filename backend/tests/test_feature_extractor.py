# -*- coding: utf-8 -*-
import pytest
from backend.analyzers.feature_extractor import FeatureExtractor

def test_feature_extractor_initialization():
    extractor = FeatureExtractor()
    assert extractor is not None

def test_extract_features_empty():
    extractor = FeatureExtractor()
    features = extractor.extract_features("")
    assert features["length"] == 0
    assert features["formula_count"] == 0
    assert features["question_type"] == "unknown"

def test_extract_features_basic_calculation():
    extractor = FeatureExtractor()
    # Use English text to avoid encoding issues in test file
    text = "Calculate 1 + 1"
    features = extractor.extract_features(text)
    
    assert features["length"] > 0
    # Note: "Calculate" is not in the Chinese keyword list, so it might default to calculation or unknown
    # Let's update the test expectation or the extractor keywords if needed.
    # But wait, the extractor has English keywords too?
    # Let's check extractor code. It has "calculation": ["计算", "求", "解", "化简", "值"]
    # It does NOT have English keywords.
    # So I should add English keywords to the extractor or use unicode escape sequences in test.
    
    # Let's try unicode escape sequences for Chinese characters to be safe
    # "计算" = \u8ba1\u7b97
    text = "\u8ba1\u7b97 1 + 1"
    features = extractor.extract_features(text)
    
    assert features["question_type"] == "calculation"
    assert features["estimated_difficulty"] == "easy"

def test_extract_features_with_latex():
    extractor = FeatureExtractor()
    # "求积分" = \u6c42\u79ef\u5206
    text = "\u6c42\u79ef\u5206 $\\int_0^1 x^2 dx$"
    features = extractor.extract_features(text)
    
    assert features["has_latex"] is True
    assert features["formula_count"] >= 1
    assert features["question_type"] == "calculation"

def test_extract_features_proof_hard():
    extractor = FeatureExtractor()
    # "证明" = \u8bc1\u660e
    text = "\u8bc1\u660e $\\epsilon > 0$ ..."
    features = extractor.extract_features(text)
    
    assert features["question_type"] == "proof"
    assert features["estimated_difficulty"] in ["medium", "hard"]

def test_symbol_density():
    extractor = FeatureExtractor()
    text = "a + b = c"
    features = extractor.extract_features(text)
    assert features["symbol_density"] > 0
