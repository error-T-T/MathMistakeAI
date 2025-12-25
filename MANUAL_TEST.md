# 手动检验指南

## 1. 验证后端服务运行状态

### 检查服务是否启动
```bash
# 查看后端服务日志
curl http://localhost:8000/health
```

**预期结果：**
```json
{"status":"healthy","message":"MathMistakeAI API is running"}
```

## 2. 测试文本导入功能

### 使用curl命令测试
```bash
curl -X POST http://localhost:8000/api/import/text \
-H "Content-Type: application/json" \
-d '{"text":"[题目ID] Q001\n[题目类型] 计算题\n[题目内容] 计算∫(0 to 1) x^2 dx\n[错误过程] 使用了基本积分公式，但忘记了代入上下限\n[错误答案] 1/3\n[正确答案] 1/3\n[知识点标签] 定积分, 微积分基本定理\n[难度等级] 中等"}'
```

**预期结果：**
```json
{"success":true,"message":"成功导入 1 道错题","mistakes":[{"id":"...","question_id":"Q001","question_type":"计算题","question_content":"计算∫(0 to 1) x^2 dx","wrong_process":"使用了基本积分公式，但忘记了代入上下限","wrong_answer":"1/3","correct_answer":"1/3","knowledge_points":["定积分","微积分基本定理"],"difficulty_level":"中等","message":null}]}
```

## 3. 测试文件上传功能

### 使用curl命令测试
```bash
curl -X POST http://localhost:8000/api/import/file \
-F "file=@sample_data/example_mistakes.txt"
```

**预期结果：**
```json
{"success":true,"message":"成功导入 2 道错题","mistakes":[...]} 
```

## 4. 验证数据存储

### 查看CSV文件内容
```bash
cat Ver1.0.0/backend/data/mistakes.csv
```

**预期结果：**
包含导入的错题数据，格式为CSV格式，字段包括id、question_id、question_type等。

## 5. 测试获取所有错题

### 使用curl命令测试
```bash
curl http://localhost:8000/api/mistakes
```

**预期结果：**
返回所有导入的错题数据，格式为JSON数组。

## 6. 测试根据ID获取错题

### 使用curl命令测试（替换实际的ID）
```bash
curl http://localhost:8000/api/mistakes/f3c3c7eb-1075-400d-aeed-3b9bd9941509
```

**预期结果：**
返回指定ID的错题详细数据。

## 7. 分享给其他AI的提示词

### 功能说明
系统提供了将错题数据分享给其他AI助手的提示词模板，方便用户在第三方AI中进行错题分析。

### 前端使用方式
1. 进入"错题管理"页面
2. 点击"导入错题"按钮
3. 在导入模态框底部找到"💡 分享给其他AI的提示词"区域
4. 点击"📋 复制提示词"按钮，将提示词模板复制到剪贴板
5. 将复制的提示词粘贴给其他AI助手（如Claude、ChatGPT等）
6. 根据提示词模板填入相应的错题信息

### 提示词模板
```
你是一个数学导师。请分析以下学生的错题并提供详细指导：

【题目ID】：{请填入题目ID}
【题目类型】：{请填入题目类型}
【题目内容】：{请填入题目内容}
【学生的错误过程或答案】：{请填入错误过程或答案}
【正确答案】：{请填入正确答案}
【涉及知识点】：{请填入知识点标签}
【难度等级】：{请填入难度等级}

请按以下结构化格式回复：
1. **错误类型诊断**：明确是概念不清、计算失误还是方法错误
2. **逐步正确解析**：展示完整的解题步骤
3. **通用解法（通法）**：总结这类题目的通用思路和步骤
4. **针对性学习建议**：基于此错误，给出复习建议

---
项目：MathMistakeAI
作者：Rookie
GitHub：https://github.com/error-T-T/MathMistakeAI
邮箱：RookieT@e.gzhu.edu.cn
```

### 使用示例
将提示词复制到其他AI后，按照模板填入实际错题数据：
```
你是一个数学导师。请分析以下学生的错题并提供详细指导：

【题目ID】：Q001
【题目类型】：计算题
【题目内容】：计算∫(0 to 1) x^2 dx
【学生的错误过程或答案】：使用了基本积分公式，但忘记了代入上下限
【正确答案】：1/3
【涉及知识点】：定积分, 微积分基本定理
【难度等级】：中等

请按以下结构化格式回复：
1. **错误类型诊断**：...
2. **逐步正确解析**：...
3. **通用解法（通法）**：...
4. **针对性学习建议**：...

---
项目：MathMistakeAI
作者：Rookie
GitHub：https://github.com/error-T-T/MathMistakeAI
邮箱：RookieT@e.gzhu.edu.cn
```

## 8. 常见问题排查

### 服务无法启动
- 检查端口是否被占用：`netstat -ano | findstr :8000`
- 检查依赖是否安装：`pip install -r Ver1.0.0/backend/requirements.txt`

### 导入失败
- 检查输入格式是否符合模板要求
- 检查字段是否完整（题目ID、题目内容、错误答案、正确答案为必填字段）
- 检查文件编码是否为UTF-8

### 数据无法正确解析
- 检查模板格式是否正确，特别是字段名称是否包含方括号
- 检查题目之间是否有足够的分隔空行
