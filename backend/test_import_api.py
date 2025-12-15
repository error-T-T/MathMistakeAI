#!/usr/bin/env python3
"""
测试数据导入API
作者: Rookie (error-T-T) & 艾可希雅
GitHub ID: error-T-T
学校邮箱: RookieT@e.gzhu.edu.cn
"""

import sys
import os
import requests
import json

# 添加当前目录到Python路径
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

def test_import_text_api():
    """测试文本导入API"""
    print("测试文本导入API端点...")

    # 测试文本
    test_text = """[题目类型] 计算题
[题目内容] 计算∫(0 to 1) x^2 dx
[错误过程] 我用了基本积分公式，但忘记了上下限
[错误答案] 1/3
[正确答案] 1/3
[知识点标签] 定积分, 微积分基本定理
[难度等级] 中等

[题目类型] 计算题
[题目内容] 求函数f(x) = x^3 - 3x^2 + 2的极值点
[错误过程] 求导得到f'(x)=3x^2-6x，令其等于0得到x=0,2，但没有判断极大极小
[错误答案] 极值点为x=0,2
[正确答案] 极大值点x=0，极小值点x=2
[知识点标签] 导数应用, 极值问题
[难度等级] 中等"""

    try:
        # 发送POST请求
        url = "http://localhost:8002/api/import/text"
        headers = {"Content-Type": "application/json"}
        data = {"text_content": test_text}

        print(f"发送请求到: {url}")
        response = requests.post(url, json=data, headers=headers, timeout=10)

        print(f"响应状态码: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print(f"导入结果: {json.dumps(result, indent=2, ensure_ascii=False)}")

            # 验证响应结构
            assert "total_processed" in result
            assert "successful" in result
            assert "failed" in result
            assert "message" in result

            print(f"成功导入: {result['successful']} 条记录")
            print(f"导入失败: {result['failed']} 条记录")

            if result["failed"] > 0 and "failed_details" in result:
                for detail in result["failed_details"]:
                    print(f"失败详情: {detail}")

            print("[OK] 文本导入API测试通过!")
            return True
        else:
            print(f"[ERROR] API请求失败: {response.status_code}")
            print(f"响应内容: {response.text}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"[ERROR] 网络请求失败: {str(e)}")
        return False
    except Exception as e:
        print(f"[ERROR] 测试失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_sample_format_api():
    """测试获取样本格式API"""
    print("\n测试获取样本格式API...")

    try:
        url = "http://localhost:8002/api/import/sample"
        print(f"发送GET请求到: {url}")

        response = requests.get(url, timeout=10)
        print(f"响应状态码: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print(f"样本格式响应: {json.dumps(result, indent=2, ensure_ascii=False)}")

            # 验证响应结构
            assert "format_description" in result
            assert "supported_fields" in result
            assert "sample" in result

            print(f"支持的字段: {result['supported_fields']}")
            print(f"示例文本长度: {len(result['sample'])} 字符")

            print("[OK] 样本格式API测试通过!")
            return True
        else:
            print(f"[ERROR] API请求失败: {response.status_code}")
            print(f"响应内容: {response.text}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"[ERROR] 网络请求失败: {str(e)}")
        return False
    except Exception as e:
        print(f"[ERROR] 测试失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_mistakes_api():
    """测试错题列表API以验证导入数据"""
    print("\n验证导入数据...")

    try:
        url = "http://localhost:8002/api/mistakes?page=1&page_size=10"
        print(f"发送GET请求到: {url}")

        response = requests.get(url, timeout=10)
        print(f"响应状态码: {response.status_code}")

        if response.status_code == 200:
            mistakes = response.json()
            print(f"当前错题总数: {len(mistakes)}")

            for idx, mistake in enumerate(mistakes[:3]):  # 只显示前3个
                print(f"  {idx + 1}. ID: {mistake.get('id', 'N/A')}, 题目: {mistake.get('question_content', 'N/A')[:40]}...")

            print("[OK] 错题列表API测试通过!")
            return True
        else:
            print(f"[ERROR] API请求失败: {response.status_code}")
            print(f"响应内容: {response.text}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"[ERROR] 网络请求失败: {str(e)}")
        return False
    except Exception as e:
        print(f"[ERROR] 测试失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """主测试函数"""
    print("开始测试数据导入API功能")
    print("=" * 50)

    # 等待服务器完全启动
    import time
    time.sleep(2)

    test1_passed = test_import_text_api()
    test2_passed = test_sample_format_api()
    test3_passed = test_mistakes_api()

    print("\n" + "=" * 50)
    if test1_passed and test2_passed and test3_passed:
        print("[SUCCESS] 所有API测试通过! 数据导入功能完整可用。")
        return 0
    else:
        print("[ERROR] 部分测试失败，请检查代码。")
        return 1

if __name__ == "__main__":
    sys.exit(main())