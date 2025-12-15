#!/usr/bin/env python3
"""
测试后端服务器连接
作者: Rookie (error-T-T) & 艾可希雅
GitHub ID: error-T-T
学校邮箱: RookieT@e.gzhu.edu.cn
"""

import sys
import os
import requests
import json

def test_backend_connection():
    """测试后端服务器连接"""
    print("测试后端服务器连接...")

    base_url = "http://localhost:8002"

    endpoints = [
        ("/", "根端点"),
        ("/health", "健康检查"),
        ("/api/version", "API版本"),
        ("/api/mistakes?page=1&page_size=5", "错题列表"),
        ("/api/import/sample", "导入样本格式")
    ]

    all_passed = True

    for endpoint, description in endpoints:
        url = base_url + endpoint
        try:
            print(f"\n测试 {description} ({endpoint})...")
            response = requests.get(url, timeout=5)

            print(f"  状态码: {response.status_code}")

            if response.status_code == 200:
                print(f"  [OK] {description} 响应正常")

                # 尝试解析JSON响应
                try:
                    data = response.json()
                    if isinstance(data, dict) and endpoint == "/":
                        print(f"  服务名称: {data.get('service', 'N/A')}")
                        print(f"  状态: {data.get('status', 'N/A')}")
                except:
                    # 如果不是JSON，忽略
                    pass
            else:
                print(f"  [ERROR] {description} 返回非200状态码")
                print(f"  响应内容: {response.text[:200]}")
                all_passed = False

        except requests.exceptions.ConnectionError:
            print(f"  [ERROR] 无法连接到 {url}")
            print(f"  请确保后端服务器正在端口8002上运行")
            all_passed = False
        except requests.exceptions.Timeout:
            print(f"  [ERROR] 连接超时: {url}")
            all_passed = False
        except Exception as e:
            print(f"  [ERROR] 测试失败: {str(e)}")
            all_passed = False

    # 测试CORS头部
    print("\n测试CORS头部...")
    try:
        response = requests.options(f"{base_url}/api/mistakes", timeout=5)
        print(f"  OPTIONS请求状态码: {response.status_code}")

        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
        }

        print(f"  CORS头部: {cors_headers}")

        if cors_headers['Access-Control-Allow-Origin']:
            print(f"  [OK] CORS配置存在")
        else:
            print(f"  [WARNING] 未找到CORS头部")

    except Exception as e:
        print(f"  [ERROR] CORS测试失败: {str(e)}")

    return all_passed

def main():
    """主测试函数"""
    print("开始测试后端服务器连接")
    print("=" * 50)

    try:
        import requests
    except ImportError:
        print("[ERROR] requests模块未安装，请运行: pip install requests")
        return 1

    all_passed = test_backend_connection()

    print("\n" + "=" * 50)
    if all_passed:
        print("[SUCCESS] 后端服务器连接测试通过!")
        print("\n建议操作:")
        print("1. 确保前端开发服务器使用更新后的配置")
        print("2. 重启前端开发服务器: cd frontend && npm run dev")
        print("3. 在浏览器中访问 http://localhost:5173 (或实际端口)")
        print("4. 刷新页面清除缓存")
        return 0
    else:
        print("[ERROR] 后端服务器连接测试失败")
        print("\n可能的问题:")
        print("1. 后端服务器未运行在端口8002")
        print("2. 防火墙或网络配置阻止连接")
        print("3. 后端服务启动失败")
        return 1

if __name__ == "__main__":
    sys.exit(main())