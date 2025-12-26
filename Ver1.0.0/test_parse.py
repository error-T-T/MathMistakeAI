"""
测试后端数据解析逻辑
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from data import data_manager

# 测试文本
test_text = """[题目ID] Q001
[题目类型] 计算题
[题目内容] 计算∫(0 to 1) x^2 dx
[错误过程] 直接使用不定积分公式，忘记计算上下限的差值，得到 x^3/3 + C 后直接写结果
[错误答案] x^3/3 + C
[正确答案] 1/3
[知识点标签] 定积分, 微积分基本定理
[难度等级] 中等

[题目ID] Q002
[题目类型] 计算题
[题目内容] 求函数 f(x) = x^2 在 x=2 处的导数
[错误过程] 使用了积分公式而不是求导公式
[错误答案] x^3/3
[正确答案] 4
[知识点标签] 导数, 基本求导法则
[难度等级] 简单

[题目ID] Q003
[题目类型] 证明题
[题目内容] 证明 lim(x→0) sin(x)/x = 1
[错误过程] 直接使用洛必达法则，没有验证条件
[错误答案] 0/0 形式，使用洛必达法则得 cos(x)/1 = 1
[正确答案] 使用夹逼定理或单位圆几何证明
[知识点标签] 极限, 洛必达法则, 夹逼定理
[难度等级] 困难
"""

print("测试 parse_mistake_text 函数...")
try:
    mistakes = data_manager.parse_mistake_text(test_text)
    print(f"✓ 成功解析 {len(mistakes)} 道错题")
    
    for i, mistake in enumerate(mistakes):
        print(f"\n--- 错题 {i+1} ---")
        print(f"ID: {mistake.get('id', 'N/A')}")
        print(f"题目ID: {mistake.get('question_id', 'N/A')}")
        print(f"题目内容: {mistake.get('question_content', 'N/A')[:50]}...")
        print(f"知识点: {mistake.get('knowledge_points', [])}")
        print(f"难度: {mistake.get('difficulty_level', 'N/A')}")
        
        # 验证必要字段
        required = ['id', 'question_id', 'question_content', 'wrong_answer', 'correct_answer']
        missing = [f for f in required if f not in mistake]
        if missing:
            print(f"⚠ 缺少必要字段: {missing}")
        else:
            print("✓ 所有必要字段都存在")
    
    # 测试保存功能
    print("\n\n测试 save_mistake 函数...")
    saved_count = 0
    for mistake in mistakes:
        try:
            saved = data_manager.save_mistake(mistake)
            saved_count += 1
            print(f"✓ 保存成功: {saved.get('question_id')}")
        except Exception as e:
            print(f"✗ 保存失败: {e}")
    
    print(f"\n✓ 共成功保存 {saved_count} 道错题")
    
except Exception as e:
    print(f"✗ 解析失败: {e}")
    import traceback
    traceback.print_exc()
