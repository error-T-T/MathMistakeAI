#!/usr/bin/env python3
"""Simple MathMistakeAI launcher
Author: Rookie (error-T-T) & Exia
GitHub: error-T-T
Email: RookieT@e.gzhu.edu.cn

This launcher focuses on being robust and easy to maintain:
- No complex health-check loops
- Just start backend and frontend, print URLs
- Allow Ctrl+C to stop and clean up
"""

import os
import sys
import subprocess
import time
import signal
from typing import Optional
import shutil
import webbrowser

BACKEND_PORT = 8000
FRONTEND_PORT = 5173
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")
VENV_DIR = os.path.join(ROOT_DIR, "venv")


class SimpleLauncher:
    def __init__(self) -> None:
        self.backend_proc: Optional[subprocess.Popen] = None
        self.frontend_proc: Optional[subprocess.Popen] = None
        signal.signal(signal.SIGINT, self._handle_signal)
        signal.signal(signal.SIGTERM, self._handle_signal)

    # ----------------- helpers -----------------
    def _python_path(self) -> str:
        """Return python executable inside venv, or fallback to current python."""
        if os.name == "nt":
            cand = os.path.join(VENV_DIR, "Scripts", "python.exe")
        else:
            cand = os.path.join(VENV_DIR, "bin", "python")
        return cand if os.path.exists(cand) else sys.executable

    def _log(self, kind: str, msg: str) -> None:
        print(f"[{kind}] {msg}")

    # ----------------- start / stop -----------------
    def start_backend(self) -> None:
        self._log("INFO", "Starting backend...")
        python_exe = self._python_path()
        cmd = [python_exe, "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", f"--port={BACKEND_PORT}"]
        self._log("INFO", "Backend cmd: " + " ".join(cmd))

        self.backend_proc = subprocess.Popen(
            cmd,
            cwd=BACKEND_DIR,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=False,
            bufsize=1,
        )

    def start_frontend(self) -> None:
        self._log("INFO", "Starting frontend...")
        if not os.path.isdir(FRONTEND_DIR):
            self._log("ERROR", f"Frontend directory not found: {FRONTEND_DIR}")
            return
        npm_path = shutil.which("npm") if hasattr(__import__('shutil'), 'which') else None
        cmd = [npm_path or "npm", "run", "dev"]
        self._log("INFO", "Frontend cmd: " + " ".join(cmd))

        try:
            self.frontend_proc = subprocess.Popen(
                cmd,
                cwd=FRONTEND_DIR,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=False,
                bufsize=1,
            )
        except FileNotFoundError as e:
            self._log("ERROR", f"Failed to start frontend: {e}. Is Node.js/npm installed and in PATH?")
            self.frontend_proc = None

    def _handle_signal(self, signum, frame) -> None:  # type: ignore[override]
        self._log("INFO", f"Signal {signum} received, stopping services...")
        self.stop_all()
        sys.exit(0)

    def stop_all(self) -> None:
        # terminate child processes gracefully
        for name, proc in ("backend", self.backend_proc), ("frontend", self.frontend_proc):
            if proc is None:
                continue
            try:
                self._log("INFO", f"Stopping {name}...")
                proc.terminate()
                proc.wait(timeout=5)
            except Exception:
                try:
                    proc.kill()
                except Exception:
                    pass

    # ----------------- main loop -----------------
    def run(self) -> int:
        # start services
        self.start_backend()
        time.sleep(2)  # small delay so backend can boot
        self.start_frontend()

        frontend_url = f"http://127.0.0.1:{FRONTEND_PORT}"
        self._log("SUCCESS", f"Backend:  http://127.0.0.1:{BACKEND_PORT}")
        self._log("SUCCESS", f"Frontend: {frontend_url}")
        try:
            webbrowser.open(frontend_url)
        except Exception:
            self._log("WARN", "Failed to open browser automatically. Please open the URL manually.")
        self._log("INFO", "Press Ctrl+C to stop both backend and frontend.")

        try:
            # simple log tail; stop when both processes exit
            while True:
                alive = False
                for name, proc in ("backend", self.backend_proc), ("frontend", self.frontend_proc):
                    if proc is None:
                        continue
                    if proc.poll() is None:
                        alive = True
                        if proc.stdout is not None and not proc.stdout.closed:
                            try:
                                raw = proc.stdout.readline()
                            except Exception:
                                raw = b""
                            if raw:
                                try:
                                    line = raw.decode("utf-8", errors="replace").rstrip()
                                except Exception:
                                    line = raw.decode(errors="replace").rstrip()
                                if line:
                                    self._log(name.upper(), line)
                if not alive:
                    self._log("INFO", "Both services stopped.")
                    break
                time.sleep(0.2)
        except KeyboardInterrupt:
            self._log("INFO", "KeyboardInterrupt, stopping...")
        finally:
            self.stop_all()
        return 0


def main() -> int:
    launcher = SimpleLauncher()
    return launcher.run()


if __name__ == "__main__":
    sys.exit(main())