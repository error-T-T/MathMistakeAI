"""
请求日志记录中间件
作者: Rookie (error-T-T) & 艾可希雅
GitHub ID: error-T-T
学校邮箱: RookieT@e.gzhu.edu.cn
"""

import time
import logging
from fastapi import Request
from typing import Callable
from fastapi.middleware.base import BaseHTTPMiddleware

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),  # 输出到控制台
        logging.FileHandler('logs/backend.log', encoding='utf-8')  # 输出到文件
    ]
)

logger = logging.getLogger("math_mistake_api")

class LoggingMiddleware(BaseHTTPMiddleware):
    """请求日志记录中间件"""

    async def dispatch(self, request: Request, call_next: Callable):
        # 记录请求开始时间
        start_time = time.time()

        # 获取请求信息
        request_info = {
            "method": request.method,
            "url": str(request.url),
            "client_host": request.client.host if request.client else "unknown",
            "client_port": request.client.port if request.client else "unknown",
            "headers": dict(request.headers),
            "query_params": dict(request.query_params),
        }

        # 记录请求信息（排除敏感信息）
        safe_headers = {k: v for k, v in request_info["headers"].items()
                       if k.lower() not in ["authorization", "cookie", "x-api-key"]}

        logger.info(
            f"请求开始 - {request_info['method']} {request_info['url']} "
            f"来自 {request_info['client_host']}:{request_info['client_port']}"
        )
        logger.debug(f"请求头: {safe_headers}")
        logger.debug(f"查询参数: {request_info['query_params']}")

        try:
            # 处理请求
            response = await call_next(request)

            # 计算处理时间
            process_time = time.time() - start_time

            # 记录响应信息
            response_info = {
                "status_code": response.status_code,
                "process_time_ms": round(process_time * 1000, 2),
                "headers": dict(response.headers),
            }

            logger.info(
                f"请求完成 - {request_info['method']} {request_info['url']} "
                f"状态: {response_info['status_code']} "
                f"耗时: {response_info['process_time_ms']}ms"
            )

            # 添加X-Process-Time头部
            response.headers["X-Process-Time"] = str(response_info["process_time_ms"])

            return response

        except Exception as e:
            # 记录异常
            process_time = time.time() - start_time
            logger.error(
                f"请求异常 - {request_info['method']} {request_info['url']} "
                f"异常: {str(e)} "
                f"耗时: {round(process_time * 1000, 2)}ms"
            )
            raise

def setup_logging():
    """设置日志配置"""
    import os
    os.makedirs("logs", exist_ok=True)

    # 创建不同的日志记录器
    api_logger = logging.getLogger("math_mistake_api")
    api_logger.setLevel(logging.INFO)

    data_logger = logging.getLogger("math_mistake_data")
    data_logger.setLevel(logging.INFO)

    ai_logger = logging.getLogger("math_mistake_ai")
    ai_logger.setLevel(logging.INFO)

    # 移除默认的处理器，避免重复日志
    api_logger.handlers.clear()

    # 创建格式化器
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    # 控制台处理器
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)

    # 文件处理器 - API日志
    api_file_handler = logging.FileHandler('logs/api.log', encoding='utf-8')
    api_file_handler.setLevel(logging.INFO)
    api_file_handler.setFormatter(formatter)

    # 文件处理器 - 错误日志
    error_file_handler = logging.FileHandler('logs/error.log', encoding='utf-8')
    error_file_handler.setLevel(logging.ERROR)
    error_file_handler.setFormatter(formatter)

    # 文件处理器 - 访问日志
    access_file_handler = logging.FileHandler('logs/access.log', encoding='utf-8')
    access_file_handler.setLevel(logging.INFO)
    access_file_handler.setFormatter(formatter)

    # 添加处理器到API记录器
    api_logger.addHandler(console_handler)
    api_logger.addHandler(api_file_handler)
    api_logger.addHandler(error_file_handler)

    # 为访问日志创建专门的记录器
    access_logger = logging.getLogger("math_mistake_access")
    access_logger.addHandler(access_file_handler)
    access_logger.setLevel(logging.INFO)

    return api_logger, data_logger, ai_logger

# 导出日志记录器
api_logger, data_logger, ai_logger = setup_logging()

def log_request(request: Request, response, process_time_ms: float):
    """记录访问日志"""
    access_logger = logging.getLogger("math_mistake_access")

    log_data = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "method": request.method,
        "url": str(request.url),
        "client_host": request.client.host if request.client else "unknown",
        "client_port": request.client.port if request.client else "unknown",
        "status_code": response.status_code,
        "process_time_ms": process_time_ms,
        "user_agent": request.headers.get("user-agent", ""),
    }

    access_logger.info(
        f"{log_data['timestamp']} - "
        f"{log_data['method']} {log_data['url']} - "
        f"{log_data['client_host']}:{log_data['client_port']} - "
        f"状态: {log_data['status_code']} - "
        f"耗时: {log_data['process_time_ms']}ms - "
        f"User-Agent: {log_data['user_agent']}"
    )