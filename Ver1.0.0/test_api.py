"""
测试API导入功能
"""

import requests
import os

BASE_URL = "http://localhost:8001"

# 测试健康检查
print("测试健康检查端点...")
try:
    response = requests.get(f"{BASE_URL}/health")
    print(f"✓ 健康检查: {response.json()}")
except Exception as e:
    print(f"✗ 健康检查失败: {e}")

# 读取测试文件
test_file_path = os.path.join(os.path.dirname(__file__), "sample_data", "test_import.txt")
print(f"\n读取测试文件: {test_file_path}")

with open(test_file_path, 'r', encoding='utf-8') as f:
    test_content = f.read()

print(f"文件内容预览:\n{test_content[:200]}...")

# 测试文本导入API
print("\n\n测试文本导入API...")
try:
    response = requests.post(
        f"{BASE_URL}/api/import/text",
        json={"text": test_content}
    )
    print(f"状态码: {response.status_code}")
    print(f"响应: {response.json()}")
except Exception as e:
    print(f"✗ 文本导入失败: {e}")

# 测试文件导入API
print("\n\n测试文件导入API...")
try:
    with open(test_file_path, 'rb') as f:
        files = {'file': ('test_import.txt', f, 'text/plain')}
        response = requests.post(f"{BASE_URL}/api/import/file", files=files)
    
    print(f"状态码: {response.status_code}")
    print(f"响应: {response.json()}")
except Exception as e:
    print(f"✗ 文件导入失败: {e}")

# 测试获取所有错题
print("\n\n测试获取所有错题...")
try:
    response = requests.get(f"{BASE_URL}/api/mistakes")
    print(f"状态码: {response.status_code}")
    data = response.json()
    print(f"获取到 {len(data)} 道错题")
    if data:
        print(f"第一道错题: {data[0].get('question_id', 'N/A')}")
except Exception as e:
    print(f"✗ 获取错题失败: {e}")

print("\n\n测试完成!")
