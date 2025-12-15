#!/usr/bin/env python3
"""
测试完整功能流程
"""

import requests
import json

def test_full_flow():
    """测试完整功能流程"""
    base_url = "http://localhost:8008"

    print("="*60)
    print("测试完整功能流程")
    print("="*60)

    # 1. 测试健康检查
    print("\n1. 测试健康检查...")
    try:
        response = requests.get(f"{base_url}/health")
        print(f"   状态码: {response.status_code}")
        print(f"   响应: {response.json()}")
    except Exception as e:
        print(f"   失败: {e}")
        return

    # 2. 测试AI健康检查
    print("\n2. 测试AI健康检查...")
    try:
        response = requests.get(f"{base_url}/api/ai/health")
        print(f"   状态码: {response.status_code}")
        data = response.json()
        print(f"   服务: {data.get('service')}")
        print(f"   状态: {data.get('status')}")
        print(f"   模型: {data.get('model')}")
        print(f"   连接: {data.get('connected')}")
        print(f"   模式: {data.get('mode')}")
    except Exception as e:
        print(f"   失败: {e}")
        return

    # 3. 测试相似题目生成（基本）
    print("\n3. 测试相似题目生成（基本）...")
    payload1 = {
        "knowledge_gaps": ["定积分", "微积分"],
        "count": 2
    }

    try:
        response = requests.post(
            f"{base_url}/api/ai/generate-practice",
            json=payload1,
            headers={"Content-Type": "application/json"}
        )
        print(f"   状态码: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   生成题目数: {data.get('count')}")
            print(f"   知识漏洞: {data.get('knowledge_gaps')}")
            questions = data.get('questions', [])
            print(f"   题目列表: {len(questions)} 道题")
            for i, q in enumerate(questions):
                print(f"   题目 {i+1}: {q.get('question', '')[:50]}...")
        else:
            print(f"   失败: {response.text}")
    except Exception as e:
        print(f"   失败: {e}")

    # 4. 测试相似题目生成（带相似度等级）
    print("\n4. 测试相似题目生成（带相似度等级）...")
    payload2 = {
        "knowledge_gaps": ["导数", "极值"],
        "difficulty": "中等",
        "count": 1,
        "similarity_level": "高"
    }

    try:
        response = requests.post(
            f"{base_url}/api/ai/generate-practice",
            json=payload2,
            headers={"Content-Type": "application/json"}
        )
        print(f"   状态码: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   相似度等级: {data.get('similarity_level')}")
            print(f"   难度: {data.get('difficulty')}")
            questions = data.get('questions', [])
            if questions:
                q = questions[0]
                print(f"   题目: {q.get('question', '')[:60]}...")
                print(f"   相似度: {q.get('similarity_level', '未知')}")
        else:
            print(f"   失败: {response.text}")
    except Exception as e:
        print(f"   失败: {e}")

    # 5. 测试错题列表
    print("\n5. 测试错题列表...")
    try:
        response = requests.get(f"{base_url}/api/mistakes?page=1&page_size=5")
        print(f"   状态码: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   总错题数: {data.get('total', 0)}")
            print(f"   当前页: {data.get('page', 1)}")
            print(f"   每页大小: {data.get('page_size', 5)}")
        else:
            print(f"   失败: {response.text}")
    except Exception as e:
        print(f"   失败: {e}")

    print("\n" + "="*60)
    print("完整功能流程测试完成")
    print("="*60)

if __name__ == "__main__":
    test_full_flow()