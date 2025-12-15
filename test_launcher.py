#!/usr/bin/env python3
"""
测试启动器功能
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from launcher import PortCleaner, DependencyChecker, Logger, Colors

def test_port_cleaner():
    """测试端口清理器"""
    print(f"{Colors.CYAN}=== 测试端口清理器 ==={Colors.RESET}")

    # 测试端口检查
    test_port = 9999  # 应该没有被占用的端口
    is_used = PortCleaner.is_port_in_use(test_port)
    print(f"端口 {test_port} 是否被占用: {is_used}")

    # 测试端口清理（应该没有效果，因为端口未被占用）
    result = PortCleaner.kill_process_by_port(test_port)
    print(f"清理端口 {test_port} 结果: {result}")

    # 清理常用端口
    ports = [8000, 8001, 8002, 5173, 5174]
    PortCleaner.clean_ports(ports)

    print(f"{Colors.GREEN}端口清理测试完成{Colors.RESET}\n")

def test_dependency_checker():
    """测试依赖检查器"""
    print(f"{Colors.CYAN}=== 测试依赖检查器 ==={Colors.RESET}")

    print("检查Python...")
    has_python = DependencyChecker.check_python()
    print(f"Python检查结果: {has_python}")

    print("检查Node.js...")
    has_node = DependencyChecker.check_node()
    print(f"Node.js检查结果: {has_node}")

    print("检查npm...")
    has_npm = DependencyChecker.check_npm()
    print(f"npm检查结果: {has_npm}")

    print("检查Ollama...")
    has_ollama = DependencyChecker.check_ollama()
    print(f"Ollama检查结果: {has_ollama}")

    print(f"{Colors.GREEN}依赖检查测试完成{Colors.RESET}\n")

def test_logger():
    """测试日志工具"""
    print(f"{Colors.CYAN}=== 测试日志工具 ==={Colors.RESET}")

    Logger.info("这是一个信息消息")
    Logger.success("这是一个成功消息")
    Logger.warning("这是一个警告消息")
    Logger.error("这是一个错误消息")
    Logger.header("这是一个标题")

    print(f"{Colors.GREEN}日志工具测试完成{Colors.RESET}\n")

if __name__ == "__main__":
    print(f"{Colors.BOLD}{Colors.MAGENTA}MathMistakeAI 启动器功能测试{Colors.RESET}\n")

    test_logger()
    test_dependency_checker()
    test_port_cleaner()

    print(f"{Colors.BOLD}{Colors.GREEN}所有测试完成！{Colors.RESET}")
    print("\n提示: 运行 'python launcher.py' 启动完整应用")
    print("      运行 'launch.bat' 或 '一键启动.bat' (Windows)")
    print("      运行 './start.sh' (Linux/Mac)")