import requests
import json

# 测试文件上传
file_path = "sample_data/example_mistakes.txt"
with open(file_path, "rb") as file:
    response = requests.post(
        "http://localhost:8000/api/import/file",
        files={"file": (file_path, file, "text/plain")}
    )

# 打印结果
print(f"文件上传状态码: {response.status_code}")
print(f"响应内容: {json.dumps(response.json(), ensure_ascii=False, indent=2)}")

# 测试获取所有错题
response = requests.get("http://localhost:8000/api/mistakes")
print(f"\n获取所有错题状态码: {response.status_code}")
print(f"错题数量: {len(response.json())}")
