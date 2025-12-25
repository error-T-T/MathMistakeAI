# 大学生数学错题智能分析系统 (MathMistakeAI)

基于本地AI的个性化错题处理系统，帮助大学生分析数学错题、生成相似题目、智能组卷。

## 项目架构

```
math-mistake-ai/
├── Ver1.0.0/                    # MVP版本
│   ├── backend/                 # 后端服务
│   │   ├── main.py              # FastAPI应用入口
│   │   ├── ai_engine.py         # Ollama模型调用
│   │   ├── analyzers/           # 错题分析模块
│   │   ├── generators/          # 题目与试卷生成模块
│   │   ├── data/                # CSV数据存储
│   │   ├── utils/               # 工具函数
│   │   ├── prompts/             # AI提示词模板
│   │   └── requirements.txt     # 依赖列表
│   └── frontend/                # React前端项目
├── sample_data/                 # 示例数据集
├── docs/                        # 文档
├── features.json                # 功能需求列表
├── init.sh                      # 初始化脚本
└── README.md                    # 项目说明
```

## 核心功能

1. **数据导入**
   - 支持粘贴文本导入错题
   - 支持上传.txt文件导入错题

2. **AI错题分析**
   - 识别数学公式/符号
   - 分析错误原因
   - 生成详细解析
   - 总结通用解法

3. **智能题目生成**
   - 可配置相似度
   - 可配置数量和难度
   - 可选择知识点

4. **智能组卷与导出**
   - 可配置试卷参数
   - 生成试卷.docx
   - 生成答案解析.docx

## 快速开始

### 环境要求

- Python 3.10+
- Node.js 18+
- Ollama (本地部署Qwen2.5-7B模型)

### 初始化项目

```bash
# 执行初始化脚本
./init.sh
```

### 手动启动服务

```bash
# 启动后端服务
cd Ver1.0.0/backend
python main.py

# 启动前端服务
cd ../frontend
npm run dev
```

### 访问系统

- 后端API: http://localhost:8000
- 前端页面: http://localhost:5173

## API文档

访问 http://localhost:8000/docs 查看自动生成的API文档。

## 手动测试

查看 [MANUAL_TEST.md](MANUAL_TEST.md) 文件获取详细的手动测试指南。

## 作者信息

- 作者：Rookie
- GitHub仓库：https://github.com/error-T-T/MathMistakeAI
- 邮箱：RookieT@e.gzhu.edu.cn
- 版本：Ver1.0.0 (MVP)

## 许可证

MIT License
