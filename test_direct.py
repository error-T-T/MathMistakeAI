import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from routers.mistakes import get_mistakes
import asyncio

async def test():
    print("Testing get_mistakes function directly...")
    try:
        # 调用函数
        result = await get_mistakes(page=1, page_size=5)
        print(f"Result type: {type(result)}")
        print(f"Result: {result}")

        # 检查是否是PaginatedResponse
        from data_models import PaginatedResponse
        if isinstance(result, PaginatedResponse):
            print("SUCCESS: Returns PaginatedResponse")
            print(f"  items: {len(result.items)}")
            print(f"  total: {result.total}")
            print(f"  page: {result.page}")
            print(f"  page_size: {result.page_size}")
            print(f"  total_pages: {result.total_pages}")
        else:
            print("ERROR: Does not return PaginatedResponse")
            print(f"  Actual type: {type(result)}")
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())