"""
项目：大学生数学错题智能分析系统 (MathMistakeAI)
作者：Rookie
GitHub仓库：https://github.com/error-T-T/MathMistakeAI
邮箱：RookieT@e.gzhu.edu.cn
版本：Ver1.0.0 (MVP)
描述：基于本地AI的个性化错题处理系统
"""

import requests
import json

API_BASE = "http://localhost:8003"

def test_health():
    """测试健康检查"""
    print("=== 测试健康检查 ===")
    response = requests.get(f"{API_BASE}/health")
    print(f"状态码: {response.status_code}")
    print(f"响应: {response.json()}")
    return response.status_code == 200

def test_import_mistakes():
    """测试导入错题数据"""
    print("\n=== 测试导入错题数据 ===")
    
    test_data = """[题目ID] Q001
[题目类型] 计算题
[题目内容] 计算∫(0 to 1) x^2 dx
[错误过程] 使用了基本积分公式，但忘记了代入上下限
[错误答案] 1/3
[正确答案] 1/3
[知识点标签] 定积分, 微积分基本定理
[难度等级] 中等

[题目ID] Q002
[题目类型] 计算题
[题目内容] 求函数 f(x) = x^3 - 3x 的极值
[错误过程] 只找到了极大值点，忽略了极小值点
[错误答案] 极大值为2，无极小值
[正确答案] 极大值为2，极小值为-2
[知识点标签] 导数, 极值, 单调性
[难度等级] 困难

[题目ID] Q003
[题目类型] 计算题
[题目内容] 求解方程 x^2 + 2x + 1 = 0
[错误过程] 使用求根公式时计算错误
[错误答案] x1=1, x2=-3
[正确答案] x=-1 (二重根)
[知识点标签] 一元二次方程, 因式分解, 判别式
[难度等级] 简单"""
    
    response = requests.post(
        f"{API_BASE}/api/import/text",
        json={"text": test_data}
    )
    print(f"状态码: {response.status_code}")
    print(f"响应: {json.dumps(response.json(), ensure_ascii=False, indent=2)}")
    return response.status_code == 200

def test_get_mistakes():
    """测试获取所有错题"""
    print("\n=== 测试获取所有错题 ===")
    response = requests.get(f"{API_BASE}/api/mistakes")
    print(f"状态码: {response.status_code}")
    data = response.json()
    print(f"错题数量: {len(data)}")
    for mistake in data:
        print(f"  - {mistake.get('question_id')}: {mistake.get('question_content')[:30]}...")
    return response.status_code == 200

def test_generate_questions():
    """测试智能题目生成"""
    print("\n=== 测试智能题目生成 ===")
    
    # 首先获取错题ID
    response = requests.get(f"{API_BASE}/api/mistakes")
    mistakes = response.json()
    
    if not mistakes:
        print("没有错题数据，跳过生成测试")
        return False
    
    mistake_id = mistakes[0].get('question_id')
    print(f"使用错题ID: {mistake_id}")
    
    # 测试不同相似度级别
    for similarity in ["仅改数字", "同类型变形", "混合知识点"]:
        print(f"\n  测试相似度: {similarity}")
        response = requests.post(
            f"{API_BASE}/api/generate/questions",
            json={
                "mistake_id": mistake_id,
                "similarity_level": similarity,
                "quantity": 3,
                "target_difficulty": "中等"
            }
        )
        print(f"  状态码: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"  消息: {data.get('message')}")
            questions = data.get('questions', [])
            print(f"  生成题目数量: {len(questions)}")
            for q in questions[:2]:  # 只显示前2道
                print(f"    - {q.get('question_content', '')[:40]}...")
        else:
            print(f"  错误: {response.text}")
    
    return response.status_code == 200

def main():
    print("=" * 60)
    print("MathMistakeAI API 测试")
    print("=" * 60)
    
    results = []
    
    # 1. 健康检查
    results.append(("健康检查", test_health()))
    
    # 2. 导入错题数据
    results.append(("导入错题数据", test_import_mistakes()))
    
    # 3. 获取错题列表
    results.append(("获取错题列表", test_get_mistakes()))
    
    # 4. 智能题目生成
    results.append(("智能题目生成", test_generate_questions()))
    
    print("\n" + "=" * 60)
    print("测试结果汇总")
    print("=" * 60)
    for name, passed in results:
        status = "✓ 通过" if passed else "✗ 失败"
        print(f"  {name}: {status}")
    
    all_passed = all(r[1] for r in results)
    print("\n" + ("全部测试通过!" if all_passed else "存在测试失败"))
    print("=" * 60)

if __name__ == "__main__":
    main()
