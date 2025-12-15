#!/usr/bin/env python3
"""
测试数据导入功能
作者: Rookie (error-T-T) & 艾可希雅
GitHub ID: error-T-T
学校邮箱: RookieT@e.gzhu.edu.cn
"""

import sys
import os

# 添加当前目录到Python路径
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from parsers.text_parser import TextParser
from data_models import MistakeCreate

def test_parser():
    """测试文本解析器"""
    print("测试文本解析器...")

    # 测试文本
    test_text = """[题目ID] Q001
[题目类型] 计算题
[题目内容] 计算∫(0 to 1) x^2 dx
[错误过程] 我用了基本积分公式，但忘记了上下限
[错误答案] 1/3
[正确答案] 1/3
[知识点标签] 定积分, 微积分基本定理
[难度等级] 中等

[题目ID] Q002
[题目类型] 计算题
[题目内容] 求函数f(x) = x^3 - 3x^2 + 2的极值点
[错误过程] 求导得到f'(x)=3x^2-6x，令其等于0得到x=0,2，但没有判断极大极小
[错误答案] 极值点为x=0,2
[正确答案] 极大值点x=0，极小值点x=2
[知识点标签] 导数应用, 极值问题
[难度等级] 中等"""

    try:
        # 解析文本
        mistake_objects = TextParser.parse_and_convert(test_text)
        print(f"[OK] 成功解析 {len(mistake_objects)} 个错题")

        for idx, mistake in enumerate(mistake_objects):
            print(f"\n[NOTE] 错题 {idx + 1}:")
            print(f"   题目内容: {mistake.question_content[:50]}...")
            print(f"   题目类型: {mistake.question_type}")
            print(f"   难度等级: {mistake.difficulty}")
            print(f"   知识点标签: {mistake.knowledge_tags}")

            # 验证数据
            assert isinstance(mistake, MistakeCreate)
            assert mistake.question_content
            assert mistake.wrong_process
            assert mistake.wrong_answer
            assert mistake.correct_answer
            assert mistake.question_type.value == "计算题"
            assert mistake.difficulty.value == "中等"

        print("\n[OK] 所有测试通过!")
        return True

    except Exception as e:
        print(f"[ERROR] 测试失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_sample_file():
    """测试样本文件解析"""
    print("\n[FILE] 测试样本文件解析...")

    sample_file_path = os.path.join(os.path.dirname(current_dir), "sample_data", "math_mistakes_sample.txt")

    if not os.path.exists(sample_file_path):
        print(f"[ERROR] 样本文件不存在: {sample_file_path}")
        return False

    try:
        with open(sample_file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        mistake_objects = TextParser.parse_and_convert(content)
        print(f"[OK] 成功解析样本文件中的 {len(mistake_objects)} 个错题")

        # 验证样本数据完整性
        assert len(mistake_objects) == 5, f"期望5个错题，实际得到{len(mistake_objects)}个"

        for idx, mistake in enumerate(mistake_objects):
            print(f"   {idx + 1}. {mistake.question_content[:40]}...")

        print("[OK] 样本文件测试通过!")
        return True

    except Exception as e:
        print(f"[ERROR] 样本文件测试失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """主测试函数"""
    print("开始测试数据导入功能")
    print("=" * 50)

    test1_passed = test_parser()
    test2_passed = test_sample_file()

    print("\n" + "=" * 50)
    if test1_passed and test2_passed:
        print("[SUCCESS] 所有测试通过! 数据导入功能就绪。")
        return 0
    else:
        print("[ERROR] 测试失败，请检查代码。")
        return 1

if __name__ == "__main__":
    sys.exit(main())