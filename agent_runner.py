#!/usr/bin/env python3
import os
import sys
import subprocess
import json

def run_command(command):
    try:
        # Force UTF-8 encoding for output
        result = subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, encoding='utf-8', errors='replace')
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        return f"Error: {e.stderr.strip()}"
    except Exception as e:
        return f"Execution Error: {str(e)}"

def main():
    print("== Agent runner: environment snapshot ==")
    print(f"Working directory: {os.getcwd()}")

    print("\n--- git: last 20 commits ---")
    print(run_command("git log --oneline -20"))

    print("\n--- git: status ---")
    print(run_command("git status --porcelain"))

    if os.path.exists("claude-progress.txt"):
        print("\n--- claude-progress.txt (tail 40 lines) ---")
        with open("claude-progress.txt", "r", encoding="utf-8") as f:
            lines = f.readlines()
            print("".join(lines[-40:]))
    else:
        print("claude-progress.txt not found")

    if os.path.exists("features.json"):
        print("\n--- features.json: highest priority unfinished items ---")
        try:
            with open("features.json", "r", encoding="utf-8") as f:
                features = json.load(f)
                unfinished = [f for f in features if not f.get("passes", False)]
                unfinished.sort(key=lambda x: x.get("priority", "low") == "high", reverse=True)
                for f in unfinished[:5]:
                    print(f"ID: {f['id']}, Category: {f['category']}, Priority: {f['priority']}")
                    print(f"Description: {f['description']}")
                    print("-" * 20)
        except Exception as e:
            print(f"Error reading features.json: {e}")
    else:
        print("features.json not found")

    if os.path.exists("backend/main.py"):
        print("\nbackend/main.py exists")
        print("Recommended: run 'python -m backend.main' or 'cd backend && uvicorn main:app --reload'")

    if os.path.exists("frontend/package.json"):
        print("\nfrontend/package.json exists")
        print("Recommended: run 'cd frontend && npm install && npm run dev'")

    if len(sys.argv) > 1 and sys.argv[1] == "--init":
        if os.path.exists("init.sh"):
            print("\nRunning init.sh...")
            # Use bash to run init.sh, assuming bash is available
            subprocess.run(["bash", "./init.sh"])
        else:
            print("init.sh not found")

    print("\n== Agent runner finished ==")

if __name__ == "__main__":
    main()
