#!/usr/bin/env python3
"""
测试API响应格式修复
作者: Rookie (error-T-T) & 艾可希雅
GitHub ID: error-T-T
学校邮箱: RookieT@e.gzhu.edu.cn
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8002/api"

def test_mistakes_endpoint():
    """测试错题列表端点"""
    print("🧪 测试错题列表端点...")
    try:
        response = requests.get(f"{BASE_URL}/mistakes", params={"page": 1, "page_size": 5})
        print(f"状态码: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"响应类型: {type(data)}")
            print(f"响应键: {list(data.keys())}")

            # 检查分页响应结构
            expected_keys = ["items", "total", "page", "page_size", "total_pages"]
            missing_keys = [key for key in expected_keys if key not in data]

            if missing_keys:
                print(f"[ERROR] 缺少分页键: {missing_keys}")
                print(f"完整响应: {json.dumps(data, indent=2, ensure_ascii=False)}")
                return False
            else:
                print(f"✅ 分页响应结构正确")
                print(f"  总记录数: {data['total']}")
                print(f"  当前页: {data['page']}")
                print(f"  每页大小: {data['page_size']}")
                print(f"  总页数: {data['total_pages']}")
                print(f"  数据项数: {len(data['items'])}")
                return True
        else:
            print(f"❌ 请求失败: {response.status_code}")
            print(f"响应: {response.text}")
            return False

    except Exception as e:
        print(f"❌ 测试异常: {e}")
        return False

def test_stats_endpoint():
    """测试统计端点"""
    print("\n🧪 测试统计端点...")
    try:
        response = requests.get(f"{BASE_URL}/mistakes/stats/summary")
        print(f"状态码: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"响应类型: {type(data)}")
            print(f"响应键: {list(data.keys())}")

            # 检查统计响应结构
            expected_keys = ["total_mistakes", "mistakes_by_type", "mistakes_by_difficulty",
                           "top_knowledge_gaps", "accuracy_trend"]
            missing_keys = [key for key in expected_keys if key not in data]

            if missing_keys:
                print(f"❌ 缺少统计键: {missing_keys}")
                print(f"完整响应: {json.dumps(data, indent=2, ensure_ascii=False)}")
                return False
            else:
                print(f"✅ 统计响应结构正确")
                print(f"  总错题数: {data['total_mistakes']}")
                print(f"  按类型统计: {data['mistakes_by_type']}")
                print(f"  按难度统计: {data['mistakes_by_difficulty']}")
                print(f"  知识漏洞: {data['top_knowledge_gaps']}")
                print(f"  正确率趋势: {data['accuracy_trend']}")
                return True
        else:
            print(f"❌ 请求失败: {response.status_code}")
            print(f"响应: {response.text}")
            return False

    except Exception as e:
        print(f"❌ 测试异常: {e}")
        return False

def test_parameter_mapping():
    """测试参数映射"""
    print("\n🧪 测试参数映射...")
    tests = [
        {"name": "knowledge_tag参数", "params": {"knowledge_tag": "微积分", "page": 1, "page_size": 5}},
        {"name": "tags参数", "params": {"tags": "微积分,极限", "page": 1, "page_size": 5}},
        {"name": "question_type参数", "params": {"question_type": "计算题", "page": 1, "page_size": 5}},
        {"name": "search参数", "params": {"search": "积分", "page": 1, "page_size": 5}},
    ]

    all_passed = True
    for test in tests:
        print(f"  测试 {test['name']}...")
        try:
            response = requests.get(f"{BASE_URL}/mistakes", params=test['params'])
            if response.status_code == 200:
                print(f"    ✅ 状态码: {response.status_code}")
            else:
                print(f"    ❌ 状态码: {response.status_code}")
                all_passed = False
        except Exception as e:
            print(f"    ❌ 异常: {e}")
            all_passed = False

    return all_passed

def main():
    print("🚀 开始API响应格式修复测试")
    print("=" * 50)

    # 停止服务器前进行测试
    tests_passed = 0
    total_tests = 3

    if test_mistakes_endpoint():
        tests_passed += 1

    if test_stats_endpoint():
        tests_passed += 1

    if test_parameter_mapping():
        tests_passed += 1

    print("\n" + "=" * 50)
    print(f"📊 测试结果: {tests_passed}/{total_tests} 通过")

    if tests_passed == total_tests:
        print("🎉 所有API响应格式修复测试通过!")
        return 0
    else:
        print("❌ 部分测试失败，需要进一步修复")
        return 1

if __name__ == "__main__":
    sys.exit(main())