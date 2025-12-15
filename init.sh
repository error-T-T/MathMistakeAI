#!/bin/bash

# MathMistakeAI 项目初始化脚本
# 作者: Rookie (error-T-T) & 艾可希雅
# GitHub ID: error-T-T
# 学校邮箱: RookieT@e.gzhu.edu.cn

set -e  # 遇到错误时退出

echo "🚀 启动 MathMistakeAI 项目初始化..."

# 检查Python版本
echo "📋 检查Python环境..."
python --version || { echo "❌ Python未安装"; exit 1; }

# 检查Node.js版本
echo "📋 检查Node.js环境..."
node --version || { echo "❌ Node.js未安装"; exit 1; }

# 检查Ollama是否安装
echo "📋 检查Ollama..."
ollama --version || echo "⚠️  Ollama未安装或未在PATH中，请确保Ollama已安装并运行"

# 创建项目目录结构
echo "📁 创建项目目录结构..."
mkdir -p backend/analyzers
mkdir -p backend/generators
mkdir -p backend/data
mkdir -p backend/utils
mkdir -p backend/prompts
mkdir -p frontend/public
mkdir -p frontend/src/components
mkdir -p frontend/src/pages
mkdir -p frontend/src/services
mkdir -p frontend/src/styles
mkdir -p frontend/src/types
mkdir -p sample_data

# 创建Python虚拟环境
echo "🐍 创建Python虚拟环境..."
python -m venv venv || { echo "❌ 创建虚拟环境失败"; exit 1; }

# 激活虚拟环境 (Windows系统)
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# 安装Python依赖
echo "📦 安装Python依赖..."
pip install --upgrade pip
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
else
    echo "📄 创建requirements.txt..."
    cat > requirements.txt << EOF
# MathMistakeAI 后端依赖
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
python-dotenv==1.0.0
requests==2.31.0
pandas==2.1.3
python-docx==1.1.0
aiofiles==23.2.1
python-multipart==0.0.6
httpx==0.25.1
numpy==1.26.2
sympy==1.12
EOF
    pip install -r requirements.txt
fi

# 创建前端项目
echo "⚛️  初始化前端项目..."
cd frontend
if [ ! -f "package.json" ]; then
    echo "📦 创建前端package.json..."
    cat > package.json << EOF
{
  "name": "math-mistake-ai-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@tanstack/react-query": "^5.12.0",
    "axios": "^1.6.2",
    "recharts": "^2.10.0",
    "framer-motion": "^10.16.4",
    "katex": "^0.16.9",
    "react-katex": "^3.1.0",
    "lucide-react": "^0.309.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.53.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.0",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "typescript": "^5.2.2",
    "vite": "^5.0.0"
  }
}
EOF
fi

# 安装前端依赖
echo "📦 安装前端依赖..."
npm install || { echo "❌ 前端依赖安装失败"; exit 1; }

# 返回项目根目录
cd ..

# 初始化Git仓库
echo "📚 初始化Git仓库..."
git init || { echo "❌ Git初始化失败"; exit 1; }

# 创建.gitignore
echo "📄 创建.gitignore..."
cat > .gitignore << EOF
# Python
venv/
__pycache__/
*.py[cod]
*$py.class
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
.pytest_cache/

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*
lerna-debug.log*
.DS_Store
dist/
dist-ssr/
*.local

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# Ollama models
models/

# 临时文件
temp/
tmp/
*.tmp
*.temp

# 数据文件（示例数据除外）
*.csv
!sample_data/*.csv

# 生成的文档
*.docx
output/
EOF

# 创建claude-progress.txt
echo "📝 创建进度跟踪文件..."
cat > claude-progress.txt << 'EOF'
# MathMistakeAI 项目进度跟踪
## 项目初始化完成 - 2025-12-15

### 项目信息
- **项目名称**: 大学生数学错题智能分析系统 (MathMistakeAI)
- **开发者**: Rookie (error-T-T) & 艾可希雅
- **GitHub ID**: error-T-T
- **学校邮箱**: RookieT@e.gzhu.edu.cn

### 技术栈
- **后端**: Python + FastAPI + Ollama (Qwen2.5-7B)
- **前端**: React + TypeScript + Vite + Tailwind CSS
- **AI技术**: NLP特征提取、提示词工程、文本生成、简单推荐逻辑

### 已创建的基础设施
1. 项目目录结构
2. Python虚拟环境
3. 前端项目框架
4. Git仓库和.gitignore
5. features.json需求文件
6. 初始化脚本

### 待办事项
- 实现核心后端模块
- 开发前端界面
- 集成Ollama AI模型
- 创建示例数据集
- 端到端测试

EOF

# 创建基础配置文件
echo "⚙️  创建基础配置文件..."

# 创建后端.env文件
cat > backend/.env.example << EOF
# Ollama配置
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b-instruct

# 服务器配置
HOST=0.0.0.0
PORT=8000
DEBUG=true

# 数据文件路径
DATA_FILE_PATH=data/mistakes.csv
SAMPLE_DATA_PATH=sample_data/math_mistakes_sample.txt
EOF

# 创建前端配置文件
cat > frontend/.env.example << EOF
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=MathMistakeAI
VITE_APP_VERSION=1.0.0
EOF

# 创建示例数据文件
echo "📊 创建示例数据文件..."
cat > sample_data/math_mistakes_sample.txt << 'EOF'
[题目ID] Q001
[题目类型] 计算题
[题目内容] 计算∫(0 to 1) x^2 dx
[错误过程] 我用了基本积分公式，但忘记了上下限
[错误答案] 1/3
[正确答案] 1/3
[知识点标签] 定积分, 微积分基本定理
[难度等级] 中等

[题目ID] Q002
[题目类型] 计算题
[题目内容] 求函数f(x) = x^3 - 3x^2 + 2的极值点
[错误过程] 求导得到f'(x)=3x^2-6x，令其等于0得到x=0,2，但没有判断极大极小
[错误答案] 极值点为x=0,2
[正确答案] 极大值点x=0，极小值点x=2
[知识点标签] 导数应用, 极值问题
[难度等级] 中等

[题目ID] Q003
[题目类型] 计算题
[题目内容] 计算矩阵A = [[1,2],[3,4]]的行列式
[错误过程] 计算为1*4 - 2*3 = 4-6 = -2
[错误答案] -2
[正确答案] -2
[知识点标签] 矩阵, 行列式
[难度等级] 简单

[题目ID] Q004
[题目类型] 计算题
[题目内容] 求极限 lim(x→0) (sin x)/x
[错误过程] 直接代入x=0得到0/0，不知道用洛必达法则
[错误答案] 不存在
[正确答案] 1
[知识点标签] 极限, 洛必达法则
[难度等级] 中等

[题目ID] Q005
[题目类型] 计算题
[题目内容] 解微分方程 dy/dx = 2x
[错误过程] 直接积分得到y=x^2
[错误答案] y=x^2
[正确答案] y=x^2 + C
[知识点标签] 微分方程, 不定积分
[难度等级] 简单
EOF

echo "✅ 创建了5个示例错题"

# 设置脚本执行权限
chmod +x init.sh

echo ""
echo "🎉 MathMistakeAI 项目初始化完成!"
echo ""
echo "📋 下一步:"
echo "1. 确保Ollama已安装并运行: ollama run qwen2.5:7b-instruct"
echo "2. 激活虚拟环境: source venv/Scripts/activate (Windows) 或 source venv/bin/activate (Linux/Mac)"
echo "3. 启动后端服务器: cd backend && uvicorn main:app --reload"
echo "4. 启动前端开发服务器: cd frontend && npm run dev"
echo "5. 访问 http://localhost:5173 查看应用"
echo ""
echo "📝 详细进度记录在 claude-progress.txt"
echo "📋 功能需求列表在 features.json"