#!/usr/bin/env python3
"""
MathMistakeAI 高级启动器
作者: Rookie (error-T-T) & 艾可希雅
GitHub ID: error-T-T
学校邮箱: RookieT@e.gzhu.edu.cn

功能:
1. 一键启动前后端服务
2. 自动清理端口占用
3. 智能依赖检查
4. 服务健康监控
5. 自动打开浏览器
6. 优雅退出和清理
"""

import os
import sys
import subprocess
import time
import signal
import atexit
import platform
import webbrowser
from typing import Optional, List, Tuple
import socket
import requests

# 配置
CONFIG = {
    "backend_port": 8000,
    "frontend_port": 5173,
    "backend_url": "http://localhost:8000",
    "frontend_url": "http://localhost:5173",
    "health_check_path": "/health",
    "ai_health_check_path": "/api/ai/health",
    "docs_path": "/docs",
    "backend_start_cmd": ["python", "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"],
    "frontend_start_cmd": ["npm", "run", "dev"],
    "backend_dir": "backend",
    "frontend_dir": "frontend",
    "venv_dir": "venv",
    "requirements_file": "requirements.txt",
}

class Colors:
    """控制台颜色"""
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def color_text(text: str, color: str) -> str:
    """添加颜色到文本"""
    return f"{color}{text}{Colors.RESET}"

class Logger:
    """日志工具"""

    @staticmethod
    def info(msg: str):
        print(f"{color_text('[INFO]', Colors.BLUE)} {msg}")

    @staticmethod
    def success(msg: str):
        print(f"{color_text('[SUCCESS]', Colors.GREEN)} {msg}")

    @staticmethod
    def warning(msg: str):
        print(f"{color_text('[WARNING]', Colors.YELLOW)} {msg}")

    @staticmethod
    def error(msg: str):
        print(f"{color_text('[ERROR]', Colors.RED)} {msg}")

    @staticmethod
    def header(msg: str):
        print(f"\n{color_text('='*50, Colors.CYAN)}")
        print(f"{color_text(msg, Colors.CYAN + Colors.BOLD)}")
        print(f"{color_text('='*50, Colors.CYAN)}\n")

class PortCleaner:
    """端口清理工具"""

    @staticmethod
    def is_port_in_use(port: int) -> bool:
        """检查端口是否被占用"""
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(('localhost', port))
                return False
            except OSError:
                return True

    @staticmethod
    def kill_process_by_port(port: int) -> bool:
        """根据端口杀死进程（跨平台）"""
        system = platform.system()
        try:
            if system == "Windows":
                # Windows: 使用netstat和taskkill
                result = subprocess.run(
                    ["netstat", "-ano", "|", "findstr", f":{port}"],
                    capture_output=True,
                    text=True,
                    shell=True
                )
                if result.stdout:
                    lines = result.stdout.strip().split('\n')
                    for line in lines:
                        if "LISTENING" in line:
                            parts = line.strip().split()
                            if len(parts) >= 5:
                                pid = parts[-1]
                                subprocess.run(
                                    ["taskkill", "/F", "/PID", pid],
                                    capture_output=True,
                                    shell=True
                                )
                                Logger.info(f"已杀死端口 {port} 的进程 {pid}")
                                return True
            else:
                # Linux/Mac: 使用lsof或fuser
                try:
                    # 尝试使用lsof
                    result = subprocess.run(
                        ["lsof", "-ti", f":{port}"],
                        capture_output=True,
                        text=True
                    )
                    if result.stdout.strip():
                        pids = result.stdout.strip().split('\n')
                        for pid in pids:
                            if pid:
                                subprocess.run(["kill", "-9", pid], capture_output=True)
                                Logger.info(f"已杀死端口 {port} 的进程 {pid}")
                        return True
                except FileNotFoundError:
                    # 尝试使用fuser
                    result = subprocess.run(
                        ["fuser", "-k", f"{port}/tcp"],
                        capture_output=True
                    )
                    if result.returncode == 0:
                        Logger.info(f"已杀死端口 {port} 的进程")
                        return True
        except Exception as e:
            Logger.warning(f"清理端口 {port} 时出错: {e}")

        return False

    @staticmethod
    def clean_ports(ports: List[int]):
        """清理多个端口"""
        Logger.info("清理端口占用...")
        for port in ports:
            if PortCleaner.is_port_in_use(port):
                Logger.warning(f"端口 {port} 被占用，正在清理...")
                if PortCleaner.kill_process_by_port(port):
                    Logger.success(f"端口 {port} 清理成功")
                else:
                    Logger.warning(f"端口 {port} 清理失败（可能没有权限）")
                # 等待端口释放
                time.sleep(1)

class DependencyChecker:
    """依赖检查工具"""

    @staticmethod
    def check_python() -> bool:
        """检查Python"""
        try:
            result = subprocess.run([sys.executable, "--version"], capture_output=True, text=True)
            if result.returncode == 0:
                Logger.success(f"Python: {result.stdout.strip()}")
                return True
        except Exception:
            pass

        Logger.error("Python未安装或不在PATH中")
        return False

    @staticmethod
    def check_node() -> bool:
        """检查Node.js"""
        try:
            result = subprocess.run(["node", "--version"], capture_output=True, text=True)
            if result.returncode == 0:
                Logger.success(f"Node.js: {result.stdout.strip()}")
                return True
        except Exception:
            pass

        Logger.error("Node.js未安装或不在PATH中")
        return False

    @staticmethod
    def check_npm() -> bool:
        """检查npm"""
        try:
            result = subprocess.run(["npm", "--version"], capture_output=True, text=True)
            if result.returncode == 0:
                Logger.success(f"npm: {result.stdout.strip()}")
                return True
        except Exception:
            pass

        Logger.error("npm未安装或不在PATH中")
        return False

    @staticmethod
    def check_ollama() -> bool:
        """检查Ollama（可选）"""
        try:
            result = subprocess.run(["ollama", "--version"], capture_output=True, text=True)
            if result.returncode == 0:
                Logger.success(f"Ollama: {result.stdout.strip()}")
                return True
        except Exception:
            Logger.warning("Ollama未安装，AI功能将使用模拟模式")
            return True  # Ollama是可选的

        return False

    @staticmethod
    def check_all() -> bool:
        """检查所有依赖"""
        Logger.info("检查系统依赖...")
        checks = [
            DependencyChecker.check_python,
            DependencyChecker.check_node,
            DependencyChecker.check_npm,
            DependencyChecker.check_ollama,
        ]

        all_ok = True
        for check in checks:
            if not check():
                all_ok = False

        return all_ok

class ServiceManager:
    """服务管理器"""

    def __init__(self):
        self.backend_process: Optional[subprocess.Popen] = None
        self.frontend_process: Optional[subprocess.Popen] = None
        self.backend_pid: Optional[int] = None
        self.frontend_pid: Optional[int] = None

        # 注册退出处理
        atexit.register(self.cleanup)
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)

    def signal_handler(self, signum, frame):
        """信号处理"""
        Logger.info(f"接收到信号 {signum}，正在清理...")
        self.cleanup()
        sys.exit(0)

    def setup_virtualenv(self) -> bool:
        """设置Python虚拟环境"""
        if not os.path.exists(CONFIG["venv_dir"]):
            Logger.info("创建Python虚拟环境...")
            try:
                subprocess.run([sys.executable, "-m", "venv", CONFIG["venv_dir"]], check=True)
                Logger.success("虚拟环境创建成功")
            except subprocess.CalledProcessError as e:
                Logger.error(f"创建虚拟环境失败: {e}")
                return False

        return True

    def install_python_deps(self) -> bool:
        """安装Python依赖"""
        if not os.path.exists(CONFIG["requirements_file"]):
            Logger.error(f"依赖文件不存在: {CONFIG['requirements_file']}")
            return False

        Logger.info("安装Python依赖...")

        # 激活虚拟环境并安装
        if platform.system() == "Windows":
            pip_path = os.path.join(CONFIG["venv_dir"], "Scripts", "pip")
        else:
            pip_path = os.path.join(CONFIG["venv_dir"], "bin", "pip")

        try:
            # 升级pip
            subprocess.run([pip_path, "install", "--upgrade", "pip"], check=True, capture_output=True)
            # 安装依赖
            subprocess.run([pip_path, "install", "-r", CONFIG["requirements_file"]], check=True, capture_output=True)
            Logger.success("Python依赖安装完成")
            return True
        except subprocess.CalledProcessError as e:
            Logger.error(f"安装Python依赖失败: {e}")
            return False

    def install_frontend_deps(self) -> bool:
        """安装前端依赖"""
        frontend_dir = CONFIG["frontend_dir"]
        if not os.path.exists(frontend_dir):
            Logger.error(f"前端目录不存在: {frontend_dir}")
            return False

        package_json = os.path.join(frontend_dir, "package.json")
        if not os.path.exists(package_json):
            Logger.error(f"package.json不存在: {package_json}")
            return False

        Logger.info("安装前端依赖...")
        try:
            os.chdir(frontend_dir)
            subprocess.run(["npm", "install"], check=True, capture_output=True)
            os.chdir("..")
            Logger.success("前端依赖安装完成")
            return True
        except subprocess.CalledProcessError as e:
            Logger.error(f"安装前端依赖失败: {e}")
            os.chdir("..")
            return False

    def start_backend(self) -> bool:
        """启动后端服务"""
        Logger.info("启动后端服务...")

        # 清理端口
        PortCleaner.clean_ports([CONFIG["backend_port"]])

        # 进入后端目录
        original_dir = os.getcwd()
        os.chdir(CONFIG["backend_dir"])

        try:
            # 激活虚拟环境
            if platform.system() == "Windows":
                python_path = os.path.join("..", CONFIG["venv_dir"], "Scripts", "python")
            else:
                python_path = os.path.join("..", CONFIG["venv_dir"], "bin", "python")

            # 启动后端
            cmd = [python_path, "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", f"--port={CONFIG['backend_port']}"]
            Logger.info(f"后端命令: {' '.join(cmd)}")

            self.backend_process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            self.backend_pid = self.backend_process.pid

            # 等待后端启动
            Logger.info(f"等待后端服务启动 (端口: {CONFIG['backend_port']})...")
            for i in range(30):  # 最多等待30秒
                time.sleep(1)
                try:
                    response = requests.get(f"{CONFIG['backend_url']}{CONFIG['health_check_path']}", timeout=2)
                    if response.status_code == 200:
                        Logger.success("后端服务启动成功")
                        os.chdir(original_dir)
                        return True
                except requests.RequestException:
                    if i % 5 == 0:  # 每5秒打印一次状态
                        Logger.info(f"等待后端启动... ({i+1}/30秒)")

            Logger.error("后端服务启动超时")
            os.chdir(original_dir)
            return False

        except Exception as e:
            Logger.error(f"启动后端服务失败: {e}")
            os.chdir(original_dir)
            return False

    def start_frontend(self) -> bool:
        """启动前端服务"""
        Logger.info("启动前端服务...")

        # 清理端口
        PortCleaner.clean_ports([CONFIG["frontend_port"]])

        # 进入前端目录
        original_dir = os.getcwd()
        os.chdir(CONFIG["frontend_dir"])

        try:
            # 启动前端
            cmd = ["npm", "run", "dev"]
            Logger.info(f"前端命令: {' '.join(cmd)}")

            self.frontend_process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            self.frontend_pid = self.frontend_process.pid

            # 等待前端启动
            Logger.info(f"等待前端服务启动 (端口: {CONFIG['frontend_port']})...")
            for i in range(30):  # 最多等待30秒
                time.sleep(1)
                try:
                    response = requests.get(CONFIG["frontend_url"], timeout=2)
                    if response.status_code == 200:
                        Logger.success("前端服务启动成功")
                        os.chdir(original_dir)
                        return True
                except requests.RequestException:
                    if i % 5 == 0:  # 每5秒打印一次状态
                        Logger.info(f"等待前端启动... ({i+1}/30秒)")

            Logger.warning("前端服务启动可能较慢，请稍后手动访问")
            os.chdir(original_dir)
            return True  # 前端启动较慢，不视为失败

        except Exception as e:
            Logger.error(f"启动前端服务失败: {e}")
            os.chdir(original_dir)
            return False

    def open_browser(self):
        """打开浏览器"""
        Logger.info("打开浏览器...")
        try:
            webbrowser.open(CONFIG["frontend_url"])
            Logger.success(f"已打开浏览器: {CONFIG['frontend_url']}")
        except Exception as e:
            Logger.warning(f"打开浏览器失败: {e}")
            Logger.info(f"请手动访问: {CONFIG['frontend_url']}")

    def check_services_health(self) -> Tuple[bool, bool]:
        """检查服务健康状态"""
        backend_healthy = False
        frontend_healthy = False

        try:
            response = requests.get(f"{CONFIG['backend_url']}{CONFIG['health_check_path']}", timeout=2)
            backend_healthy = response.status_code == 200
        except requests.RequestException:
            pass

        try:
            response = requests.get(CONFIG["frontend_url"], timeout=2)
            frontend_healthy = response.status_code == 200
        except requests.RequestException:
            pass

        return backend_healthy, frontend_healthy

    def print_status(self):
        """打印状态信息"""
        backend_healthy, frontend_healthy = self.check_services_health()

        Logger.header("MathMistakeAI 启动完成!")

        print(f"{color_text('服务状态:', Colors.BOLD)}")
        print(f"  后端服务 ({CONFIG['backend_url']}): {color_text('✓ 运行中' if backend_healthy else '✗ 未响应', Colors.GREEN if backend_healthy else Colors.RED)}")
        print(f"  前端服务 ({CONFIG['frontend_url']}): {color_text('✓ 运行中' if frontend_healthy else '✗ 未响应', Colors.GREEN if frontend_healthy else Colors.RED)}")

        print(f"\n{color_text('访问地址:', Colors.BOLD)}")
        print(f"  前端界面: {color_text(CONFIG['frontend_url'], Colors.CYAN)}")
        print(f"  后端API: {color_text(CONFIG['backend_url'], Colors.CYAN)}")
        print(f"  API文档: {color_text(CONFIG['backend_url'] + CONFIG['docs_path'], Colors.CYAN)}")
        print(f"  健康检查: {color_text(CONFIG['backend_url'] + CONFIG['health_check_path'], Colors.CYAN)}")
        print(f"  AI健康检查: {color_text(CONFIG['backend_url'] + CONFIG['ai_health_check_path'], Colors.CYAN)}")

        print(f"\n{color_text('可用功能:', Colors.BOLD)}")
        print("  1. 错题管理页面")
        print("  2. 错题详情与AI分析")
        print("  3. 智能题目生成")
        print("  4. 数据统计可视化")

        print(f"\n{color_text('操作指南:', Colors.BOLD)}")
        print("  • 按 Ctrl+C 停止所有服务并退出")
        print("  • 服务停止时会自动清理端口占用")
        print(f"  • 查看详细日志请检查 {color_text('logs/', Colors.YELLOW)} 目录")

        print(f"\n{color_text('='*50, Colors.CYAN)}")

    def wait_for_exit(self):
        """等待用户退出"""
        print(f"\n{color_text('按 Ctrl+C 停止所有服务并退出...', Colors.YELLOW + Colors.BOLD)}")
        try:
            # 监控服务输出
            while True:
                # 检查后端输出
                if self.backend_process and self.backend_process.stdout:
                    try:
                        line = self.backend_process.stdout.readline()
                        if line:
                            print(f"{color_text('[后端]', Colors.MAGENTA)} {line.strip()}")
                    except (IOError, ValueError):
                        pass

                # 检查前端输出
                if self.frontend_process and self.frontend_process.stdout:
                    try:
                        line = self.frontend_process.stdout.readline()
                        if line:
                            print(f"{color_text('[前端]', Colors.CYAN)} {line.strip()}")
                    except (IOError, ValueError):
                        pass

                time.sleep(0.1)

        except KeyboardInterrupt:
            Logger.info("接收到中断信号，正在停止服务...")

    def cleanup(self):
        """清理资源"""
        Logger.info("正在停止服务...")

        # 停止前端服务
        if self.frontend_process:
            try:
                if platform.system() == "Windows":
                    subprocess.run(["taskkill", "/F", "/PID", str(self.frontend_pid)],
                                 capture_output=True, shell=True)
                else:
                    self.frontend_process.terminate()
                    try:
                        self.frontend_process.wait(timeout=5)
                    except subprocess.TimeoutExpired:
                        self.frontend_process.kill()
            except Exception as e:
                Logger.warning(f"停止前端服务时出错: {e}")

        # 停止后端服务
        if self.backend_process:
            try:
                if platform.system() == "Windows":
                    subprocess.run(["taskkill", "/F", "/PID", str(self.backend_pid)],
                                 capture_output=True, shell=True)
                else:
                    self.backend_process.terminate()
                    try:
                        self.backend_process.wait(timeout=5)
                    except subprocess.TimeoutExpired:
                        self.backend_process.kill()
            except Exception as e:
                Logger.warning(f"停止后端服务时出错: {e}")

        # 清理端口
        PortCleaner.clean_ports([CONFIG["backend_port"], CONFIG["frontend_port"]])

        # 等待进程完全结束
        time.sleep(2)

        Logger.success("服务已停止，端口已清理")

def main():
    """主函数"""
    # 显示标题
    Logger.header("MathMistakeAI 高级启动器")
    print(f"{color_text('作者:', Colors.BOLD)} Rookie (error-T-T) & 艾可希雅")
    print(f"{color_text('GitHub:', Colors.BOLD)} error-T-T")
    print(f"{color_text('邮箱:', Colors.BOLD)} RookieT@e.gzhu.edu.cn")

    # 创建服务管理器
    manager = ServiceManager()

    try:
        # 1. 检查依赖
        if not DependencyChecker.check_all():
            Logger.error("依赖检查失败，请安装缺失的依赖")
            return 1

        # 2. 清理端口
        PortCleaner.clean_ports([CONFIG["backend_port"], CONFIG["frontend_port"], 8001, 8002, 8003, 8004, 5174, 5175, 5176])

        # 3. 设置虚拟环境
        if not manager.setup_virtualenv():
            return 1

        # 4. 安装依赖
        if not manager.install_python_deps():
            return 1

        if not manager.install_frontend_deps():
            return 1

        # 5. 启动服务
        if not manager.start_backend():
            return 1

        if not manager.start_frontend():
            Logger.warning("前端服务可能启动失败，但继续运行...")

        # 6. 打开浏览器
        manager.open_browser()

        # 7. 显示状态
        manager.print_status()

        # 8. 等待退出
        manager.wait_for_exit()

    except Exception as e:
        Logger.error(f"启动过程中发生错误: {e}")
        import traceback
        traceback.print_exc()
        return 1
    finally:
        manager.cleanup()

    return 0

if __name__ == "__main__":
    sys.exit(main())