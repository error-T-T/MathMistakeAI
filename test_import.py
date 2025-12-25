import requests
import json

# 测试数据
mistake_text = """
[题目ID] Q001
[题目类型] 计算题
[题目内容] 计算∫(0 to 1) x^2 dx
[错误过程] 使用了基本积分公式，但忘记了代入上下限
[错误答案] 1/3
[正确答案] 1/3
[知识点标签] 定积分, 微积分基本定理
[难度等级] 中等

[题目ID] Q002
[题目类型] 计算题
[题目内容] 求解方程 x^2 - 5x + 6 = 0
[错误过程] 因式分解错误，写成了(x-2)(x-2)=0
[错误答案] x=2
[正确答案] x=2或x=3
[知识点标签] 一元二次方程, 因式分解
[难度等级] 简单
"""

# 发送POST请求
data = {"text": mistake_text}
response = requests.post("http://localhost:8000/api/import/text", json=data)

# 打印结果
print(f"状态码: {response.status_code}")
print(f"响应内容: {json.dumps(response.json(), ensure_ascii=False, indent=2)}")

# 测试获取所有错题
response = requests.get("http://localhost:8000/api/mistakes")
print(f"\n获取所有错题状态码: {response.status_code}")
print(f"错题数量: {len(response.json())}")
