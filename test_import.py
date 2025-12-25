import requests
import json

# 定义API端点
url = "http://localhost:8000/api/import/text"

# 定义测试数据
test_data = {
    "text": "[题目ID] Q001\n[题目类型] 计算题\n[题目内容] 计算∫(0 to 1) x^2 dx\n[错误过程] 使用了基本积分公式，但忘记了代入上下限\n[错误答案] 1/3\n[正确答案] 1/3\n[知识点标签] 定积分, 微积分基本定理\n[难度等级] 中等"
}

# 发送POST请求
try:
    response = requests.post(url, json=test_data)
    print(f"状态码: {response.status_code}")
    print(f"响应内容: {response.text}")
    print(f"响应头: {dict(response.headers)}")
except Exception as e:
    print(f"请求失败: {e}")
