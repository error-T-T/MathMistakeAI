import requests
import json

BASE_URL = "http://localhost:8002/api"

print("Testing API endpoint...")
resp = requests.get(f"{BASE_URL}/mistakes", params={"page": 1, "page_size": 5})
print(f"Status: {resp.status_code}")
print(f"Headers: {resp.headers}")
print(f"Content-Type: {resp.headers.get('content-type')}")
print(f"Raw response (first 500 chars): {resp.text[:500]}")

if resp.status_code == 200:
    try:
        data = resp.json()
        print(f"\nParsed JSON type: {type(data)}")
        if isinstance(data, list):
            print("Response is a LIST (old format)")
            print(f"List length: {len(data)}")
        elif isinstance(data, dict):
            print("Response is a DICT (new paginated format)")
            print(f"Dict keys: {list(data.keys())}")
            print(f"Full response:\n{json.dumps(data, indent=2, ensure_ascii=False)}")
    except Exception as e:
        print(f"JSON parse error: {e}")