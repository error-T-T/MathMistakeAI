#!/usr/bin/env python3
"""
简单测试API连接
"""

import requests
import json

def test_api():
    """测试API连接"""
    base_url = "http://localhost:8008"

    # 测试健康检查
    print("测试健康检查...")
    try:
        response = requests.get(f"{base_url}/health")
        print(f"健康检查状态码: {response.status_code}")
        print(f"响应: {response.text}")
    except Exception as e:
        print(f"健康检查失败: {e}")

    print("\n" + "="*50 + "\n")

    # 测试AI健康检查
    print("测试AI健康检查...")
    try:
        response = requests.get(f"{base_url}/api/ai/health")
        print(f"AI健康检查状态码: {response.status_code}")
        print(f"响应: {response.text}")
    except Exception as e:
        print(f"AI健康检查失败: {e}")

    print("\n" + "="*50 + "\n")

    # 测试简单的相似题目生成
    print("测试相似题目生成API...")
    payload = {
        "knowledge_gaps": ["test"],
        "count": 1
    }

    try:
        response = requests.post(
            f"{base_url}/api/ai/generate-practice",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.text[:200]}")
    except Exception as e:
        print(f"API调用失败: {e}")

if __name__ == "__main__":
    test_api()