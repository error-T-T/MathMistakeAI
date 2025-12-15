#!/usr/bin/env python3
"""
测试分析结果存储功能
作者: Rookie (error-T-T) & 艾可希雅
GitHub ID: error-T-T
学校邮箱: RookieT@e.gzhu.edu.cn
"""

import requests
import json
import time
import sys

BASE_URL = "http://localhost:8004/api"

def test_analysis_storage():
    """测试分析结果存储功能"""
    print("🧪 测试分析结果存储功能...")

    # 1. 首先获取一个错题ID（假设有数据）
    print("1. 获取错题列表...")
    try:
        resp = requests.get(f"{BASE_URL}/mistakes", params={"page": 1, "page_size": 1})
        if resp.status_code != 200:
            print(f"❌ 获取错题列表失败: {resp.status_code}")
            return False

        data = resp.json()
        if not data["items"]:
            print("⚠️  没有错题数据，需要先创建错题")
            # 尝试创建测试错题
            create_resp = requests.post(f"{BASE_URL}/mistakes", json={
                "question_content": "计算 ∫(0 to 1) x^2 dx",
                "wrong_process": "直接积分得到 x^3/3，但忘记了上下限",
                "wrong_answer": "x^3/3",
                "correct_answer": "1/3",
                "question_type": "计算题",
                "knowledge_tags": ["定积分", "微积分基本定理"],
                "difficulty": "中等"
            })
            if create_resp.status_code != 200:
                print(f"❌ 创建测试错题失败: {create_resp.status_code}")
                return False
            mistake_id = create_resp.json()["id"]
            print(f"✅ 创建了测试错题: {mistake_id}")
        else:
            mistake_id = data["items"][0]["id"]
            print(f"✅ 使用现有错题: {mistake_id}")

        # 2. 检查当前错题的analysis_result字段
        print("2. 检查当前分析结果字段...")
        detail_resp = requests.get(f"{BASE_URL}/mistakes/{mistake_id}")
        if detail_resp.status_code != 200:
            print(f"❌ 获取错题详情失败: {detail_resp.status_code}")
            return False

        detail = detail_resp.json()
        current_analysis = detail.get("analysis_result")
        if current_analysis:
            print(f"⚠️  错题已有分析结果: {current_analysis.get('error_type', '未知')}")
            # 可以选择删除或继续测试
        else:
            print("✅ 错题当前无分析结果")

        # 3. 调用AI分析端点
        print("3. 调用AI分析端点...")
        analyze_resp = requests.post(f"{BASE_URL}/mistakes/{mistake_id}/analyze")
        if analyze_resp.status_code != 200:
            print(f"❌ AI分析请求失败: {analyze_resp.status_code}")
            print(f"响应: {analyze_resp.text}")
            return False

        analysis = analyze_resp.json()
        print(f"✅ AI分析成功: {analysis.get('error_type', '未知')}")
        print(f"   置信度: {analysis.get('confidence_score', 0)}")

        # 4. 再次获取错题详情，验证analysis_result字段
        print("4. 验证分析结果已存储...")
        time.sleep(1)  # 等待一下，确保保存完成
        detail_resp2 = requests.get(f"{BASE_URL}/mistakes/{mistake_id}")
        if detail_resp2.status_code != 200:
            print(f"❌ 获取更新后错题详情失败: {detail_resp2.status_code}")
            return False

        detail2 = detail_resp2.json()
        updated_analysis = detail2.get("analysis_result")

        if not updated_analysis:
            print("❌ analysis_result字段仍为空")
            print(f"完整响应: {json.dumps(detail2, indent=2, ensure_ascii=False)}")
            return False

        # 检查分析结果字段
        expected_fields = ["mistake_id", "error_type", "root_cause", "knowledge_gap",
                          "learning_suggestions", "similar_examples", "confidence_score"]
        missing_fields = [f for f in expected_fields if f not in updated_analysis]
        if missing_fields:
            print(f"❌ 分析结果缺少字段: {missing_fields}")
            print(f"分析结果: {json.dumps(updated_analysis, indent=2, ensure_ascii=False)}")
            return False

        print(f"✅ 分析结果已成功存储")
        print(f"   错误类型: {updated_analysis.get('error_type')}")
        print(f"   知识漏洞: {updated_analysis.get('knowledge_gap')}")
        print(f"   置信度: {updated_analysis.get('confidence_score')}")

        return True

    except requests.exceptions.ConnectionError:
        print("❌ 无法连接到后端服务器，请确保服务运行在 http://localhost:8003")
        return False
    except Exception as e:
        print(f"❌ 测试过程中发生异常: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("🚀 开始测试分析结果存储功能")
    print("=" * 50)

    # 等待服务器启动（如果刚启动）
    print("等待服务器就绪...")
    for i in range(10):
        try:
            resp = requests.get("http://localhost:8004/health", timeout=2)
            if resp.status_code == 200:
                print("✅ 后端服务器已就绪")
                break
        except:
            pass
        time.sleep(1)
    else:
        print("❌ 后端服务器未启动，请先启动服务")
        return 1

    success = test_analysis_storage()

    print("\n" + "=" * 50)
    if success:
        print("🎉 分析结果存储测试通过!")
        return 0
    else:
        print("❌ 分析结果存储测试失败")
        return 1

if __name__ == "__main__":
    sys.exit(main())