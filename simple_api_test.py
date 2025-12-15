import requests
import json
import sys

BASE_URL = "http://localhost:8002/api"

print("Testing API response format fixes...")

# Test 1: Mistakes endpoint with pagination
print("\n1. Testing mistakes endpoint...")
resp = requests.get(f"{BASE_URL}/mistakes", params={"page": 1, "page_size": 5})
print(f"Status: {resp.status_code}")
if resp.status_code == 200:
    data = resp.json()
    print(f"Response keys: {list(data.keys())}")

    # Check for pagination structure
    required = ["items", "total", "page", "page_size", "total_pages"]
    missing = [k for k in required if k not in data]
    if missing:
        print(f"ERROR: Missing pagination keys: {missing}")
        print(f"Full response: {json.dumps(data, indent=2)}")
        sys.exit(1)
    else:
        print(f"SUCCESS: Pagination structure correct")
        print(f"  total: {data['total']}, page: {data['page']}, page_size: {data['page_size']}, total_pages: {data['total_pages']}")
else:
    print(f"ERROR: Request failed: {resp.text}")
    sys.exit(1)

# Test 2: Stats endpoint
print("\n2. Testing stats endpoint...")
resp = requests.get(f"{BASE_URL}/mistakes/stats/summary")
print(f"Status: {resp.status_code}")
if resp.status_code == 200:
    data = resp.json()
    print(f"Response keys: {list(data.keys())}")

    required = ["total_mistakes", "mistakes_by_type", "mistakes_by_difficulty",
                "top_knowledge_gaps", "accuracy_trend"]
    missing = [k for k in required if k not in data]
    if missing:
        print(f"ERROR: Missing stats keys: {missing}")
        print(f"Full response: {json.dumps(data, indent=2)}")
        sys.exit(1)
    else:
        print(f"SUCCESS: Stats structure correct")
else:
    print(f"ERROR: Request failed: {resp.text}")
    sys.exit(1)

# Test 3: Parameter mapping
print("\n3. Testing parameter mapping...")
test_params = [
    {"name": "knowledge_tag", "params": {"knowledge_tag": "微积分", "page": 1, "page_size": 5}},
    {"name": "tags", "params": {"tags": "微积分,极限", "page": 1, "page_size": 5}},
    {"name": "question_type", "params": {"question_type": "计算题", "page": 1, "page_size": 5}},
    {"name": "search", "params": {"search": "积分", "page": 1, "page_size": 5}},
]

for test in test_params:
    print(f"  Testing {test['name']}...")
    resp = requests.get(f"{BASE_URL}/mistakes", params=test['params'])
    if resp.status_code == 200:
        print(f"    SUCCESS: Status {resp.status_code}")
    else:
        print(f"    ERROR: Status {resp.status_code}")
        sys.exit(1)

print("\nAll tests passed! API response format fixes are working correctly.")