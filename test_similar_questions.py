#!/usr/bin/env python3
"""
测试相似题目生成API
作者: Rookie (error-T-T) & 艾可希雅
GitHub ID: error-T-T
学校邮箱: RookieT@e.gzhu.edu.cn
"""

import requests
import json

def test_similar_questions_api():
    """测试相似题目生成API"""
    base_url = "http://localhost:8006"

    # 测试1: 基本功能（无相似度等级）
    print("[测试1] 基本功能（无相似度等级）")
    payload1 = {
        "knowledge_gaps": ["定积分", "微积分基本定理"],
        "count": 3
    }

    try:
        response = requests.post(
            f"{base_url}/api/ai/generate-practice",
            json=payload1,
            headers={"Content-Type": "application/json"}
        )
        print(f"状态码: {response.status_code}")
        if response.status_code == 200:
            print("[成功] 测试1通过")
            print(json.dumps(response.json(), indent=2, ensure_ascii=False))
        else:
            print(f"[失败] 测试1失败: {response.text}")
    except Exception as e:
        print(f"[异常] 测试1异常: {e}")

    print("\n" + "="*50 + "\n")

    # 测试2: 带相似度等级（高相似度）
    print("[测试2] 带相似度等级（高相似度）")
    payload2 = {
        "knowledge_gaps": ["导数", "极值问题"],
        "difficulty": "中等",
        "count": 2,
        "similarity_level": "高"
    }

    try:
        response = requests.post(
            f"{base_url}/api/ai/generate-practice",
            json=payload2,
            headers={"Content-Type": "application/json"}
        )
        print(f"状态码: {response.status_code}")
        if response.status_code == 200:
            print("[成功] 测试2通过")
            print(json.dumps(response.json(), indent=2, ensure_ascii=False))
        else:
            print(f"[失败] 测试2失败: {response.text}")
    except Exception as e:
        print(f"[异常] 测试2异常: {e}")

    print("\n" + "="*50 + "\n")

    # 测试3: 带相似度等级（低相似度）
    print("[测试3] 带相似度等级（低相似度）")
    payload3 = {
        "knowledge_gaps": ["极限", "洛必达法则"],
        "difficulty": "简单",
        "count": 1,
        "similarity_level": "低"
    }

    try:
        response = requests.post(
            f"{base_url}/api/ai/generate-practice",
            json=payload3,
            headers={"Content-Type": "application/json"}
        )
        print(f"状态码: {response.status_code}")
        if response.status_code == 200:
            print("[成功] 测试3通过")
            print(json.dumps(response.json(), indent=2, ensure_ascii=False))
        else:
            print(f"[失败] 测试3失败: {response.text}")
    except Exception as e:
        print(f"[异常] 测试3异常: {e}")

if __name__ == "__main__":
    print("开始测试相似题目生成API")
    print("="*50)
    test_similar_questions_api()