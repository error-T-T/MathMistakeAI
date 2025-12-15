import requests
import json
import time
import sys

BASE_URL = "http://localhost:8004/api"

print("Testing analysis storage functionality...")

# Wait for server
print("Waiting for server...")
for i in range(10):
    try:
        resp = requests.get("http://localhost:8004/health", timeout=2)
        if resp.status_code == 200:
            print("Server ready")
            break
    except:
        pass
    time.sleep(1)
else:
    print("Server not ready")
    sys.exit(1)

# Get a mistake ID
print("1. Getting mistake list...")
resp = requests.get(f"{BASE_URL}/mistakes", params={"page": 1, "page_size": 1})
if resp.status_code != 200:
    print(f"Failed to get mistakes: {resp.status_code}")
    sys.exit(1)

data = resp.json()
if not data["items"]:
    print("No mistakes, creating test mistake...")
    create_resp = requests.post(f"{BASE_URL}/mistakes", json={
        "question_content": "Calculate ∫(0 to 1) x^2 dx",
        "wrong_process": "Integrated to x^3/3 but forgot limits",
        "wrong_answer": "x^3/3",
        "correct_answer": "1/3",
        "question_type": "计算题",
        "knowledge_tags": ["integration", "calculus"],
        "difficulty": "中等"
    })
    if create_resp.status_code != 200:
        print(f"Failed to create test mistake: {create_resp.status_code}")
        sys.exit(1)
    mistake_id = create_resp.json()["id"]
    print(f"Created test mistake: {mistake_id}")
else:
    mistake_id = data["items"][0]["id"]
    print(f"Using existing mistake: {mistake_id}")

# Check current analysis
print("2. Checking current analysis...")
detail_resp = requests.get(f"{BASE_URL}/mistakes/{mistake_id}")
if detail_resp.status_code != 200:
    print(f"Failed to get mistake detail: {detail_resp.status_code}")
    sys.exit(1)

detail = detail_resp.json()
if detail.get("analysis_result"):
    print(f"Mistake already has analysis: {detail['analysis_result'].get('error_type', 'unknown')}")
else:
    print("No analysis yet")

# Run AI analysis
print("3. Running AI analysis...")
analyze_resp = requests.post(f"{BASE_URL}/mistakes/{mistake_id}/analyze")
if analyze_resp.status_code != 200:
    print(f"AI analysis failed: {analyze_resp.status_code}")
    print(f"Response: {analyze_resp.text}")
    sys.exit(1)

analysis = analyze_resp.json()
print(f"AI analysis successful: {analysis.get('error_type', 'unknown')}")
print(f"Confidence: {analysis.get('confidence_score', 0)}")

# Verify storage
print("4. Verifying analysis storage...")
time.sleep(1)
detail_resp2 = requests.get(f"{BASE_URL}/mistakes/{mistake_id}")
if detail_resp2.status_code != 200:
    print(f"Failed to get updated detail: {detail_resp2.status_code}")
    sys.exit(1)

detail2 = detail_resp2.json()
updated_analysis = detail2.get("analysis_result")

if not updated_analysis:
    print("ERROR: analysis_result still empty")
    print(f"Full response: {json.dumps(detail2, indent=2)}")
    sys.exit(1)

# Check fields
expected_fields = ["mistake_id", "error_type", "root_cause", "knowledge_gap",
                  "learning_suggestions", "similar_examples", "confidence_score"]
missing = [f for f in expected_fields if f not in updated_analysis]
if missing:
    print(f"ERROR: Missing fields in analysis: {missing}")
    print(f"Analysis: {json.dumps(updated_analysis, indent=2)}")
    sys.exit(1)

print("SUCCESS: Analysis result stored successfully!")
print(f"Error type: {updated_analysis.get('error_type')}")
print(f"Knowledge gaps: {updated_analysis.get('knowledge_gap')}")
print(f"Confidence: {updated_analysis.get('confidence_score')}")

sys.exit(0)