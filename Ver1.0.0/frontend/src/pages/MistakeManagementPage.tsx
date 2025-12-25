import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { Mistake } from '../types';
import MistakeCard from '../components/MistakeCard';

const MistakeManagementPage: React.FC = () => {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [filteredMistakes, setFilteredMistakes] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchMistakes = async () => {
      try {
        setLoading(true);
        const data = await apiService.getAllMistakes();
        setMistakes(data);
      } catch (error) {
        console.error('获取错题失败:', error);
        setMistakes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMistakes();
  }, []);

  useEffect(() => {
    let result = [...mistakes];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(mistake =>
        mistake.question_content.toLowerCase().includes(term) ||
        mistake.question_id.toLowerCase().includes(term) ||
        mistake.knowledge_points.some(tag => tag.toLowerCase().includes(term))
      );
    }

    if (selectedType) {
      result = result.filter(mistake => mistake.question_type === selectedType);
    }

    if (selectedDifficulty) {
      result = result.filter(mistake => mistake.difficulty_level === selectedDifficulty);
    }

    if (selectedTags.length > 0) {
      result = result.filter(mistake =>
        selectedTags.every(tag => mistake.knowledge_points.includes(tag))
      );
    }

    setFilteredMistakes(result);
  }, [mistakes, searchTerm, selectedType, selectedDifficulty, selectedTags]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const getAllTags = () => {
    const tags = new Set<string>();
    mistakes.forEach(mistake => {
      mistake.knowledge_points.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  };

  const handleImportText = async () => {
    try {
      if (!importText.trim()) return;
      await apiService.importText(importText);
      const data = await apiService.getAllMistakes();
      setMistakes(data);
      setImportText('');
      setShowImportModal(false);
      setMessage('导入成功');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('导入文本失败:', error);
      setMessage('导入失败，请检查格式是否正确');
    }
  };

  const handleImportFile = async () => {
    try {
      if (!importFile) return;
      await apiService.importFile(importFile);
      const data = await apiService.getAllMistakes();
      setMistakes(data);
      setImportFile(null);
      setShowImportModal(false);
      setMessage('导入成功');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('导入文件失败:', error);
      setMessage('导入失败，请检查文件格式是否正确');
    }
  };

  const handleDeleteMistake = async (id: string, questionId: string) => {
    if (!confirm(`确定要删除错题 "${questionId}" 吗？`)) return;
    try {
      await apiService.deleteMistake(id);
      const data = await apiService.getAllMistakes();
      setMistakes(data);
    } catch (error) {
      console.error('删除错题失败:', error);
      setMessage('删除失败');
    }
  };

  const handleClearAllMistakes = async () => {
    if (!confirm('确定要清空所有错题吗？')) return;
    if (!confirm('再次确认：真的要删除所有错题吗？')) return;
    try {
      const result = await apiService.clearAllMistakes();
      setMistakes([]);
      setFilteredMistakes([]);
      setMessage(result.message);
    } catch (error) {
      console.error('清空错题失败:', error);
      setMessage('清空失败');
    }
  };

  return (
    <div className="container">
      {message && <div className="message">{message}</div>}

      <h1>错题管理</h1>
      <p className="subtitle">管理和查看所有导入的错题</p>

      <div className="filter-section">
        <input
          type="text"
          placeholder="搜索题目、ID或知识点..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
          <option value="">所有类型</option>
          <option value="计算题">计算题</option>
          <option value="证明题">证明题</option>
          <option value="应用题">应用题</option>
        </select>
        <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}>
          <option value="">所有难度</option>
          <option value="简单">简单</option>
          <option value="中等">中等</option>
          <option value="困难">困难</option>
        </select>
      </div>

      <div className="tags-section">
        {getAllTags().map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`tag-button ${selectedTags.includes(tag) ? 'active' : ''}`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="actions-section">
        {mistakes.length > 0 && (
          <button onClick={handleClearAllMistakes} className="btn btn-danger">
            清空所有错题
          </button>
        )}
        <button onClick={() => setShowImportModal(true)} className="btn btn-primary">
          导入错题
        </button>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : filteredMistakes.length > 0 ? (
        <div className="mistakes-grid">
          {filteredMistakes.map((mistake) => (
            <MistakeCard key={mistake.id} mistake={mistake} onDelete={handleDeleteMistake} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>未找到错题</h3>
          <p>请导入错题数据开始使用</p>
          <button onClick={() => setShowImportModal(true)} className="btn btn-primary">
            导入错题
          </button>
        </div>
      )}

      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>导入错题</h2>
              <button onClick={() => setShowImportModal(false)} className="close-btn">×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <h3>粘贴文本</h3>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="请粘贴符合模板的错题文本..."
                  className="textarea"
                />
                <div className="format-hint">
                  模板格式：[题目ID] Q001<br/>
                  [题目类型] 计算题<br/>
                  [题目内容] 计算∫(0 to 1) x^2 dx<br/>
                  [错误过程] ...<br/>
                  [错误答案] ...<br/>
                  [正确答案] ...<br/>
                  [知识点标签] ...<br/>
                  [难度等级] ...
                </div>
              </div>

              <div className="form-group">
                <h3>上传文件</h3>
                <input
                  type="file"
                  accept=".txt"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  id="import-file"
                />
                <label htmlFor="import-file" className="file-label">
                  {importFile ? `已选择：${importFile.name}` : '选择.txt文件'}
                </label>
              </div>

              <div className="ai-prompt-section">
                <h3>分享给其他AI的提示词</h3>
                <button
                  onClick={() => {
                    const prompt = `你是一个数学导师。请分析以下学生的错题并提供详细指导：

【题目ID】：{question_id}
【题目类型】：{question_type}
【题目内容】：{question_content}
【学生的错误过程或答案】：{wrong_process}
【正确答案】：{correct_answer}
【涉及知识点】：{knowledge_points}
【难度等级】：{difficulty_level}

请按以下结构化格式回复：
1. **错误类型诊断**：明确是概念不清、计算失误还是方法错误
2. **逐步正确解析**：展示完整的解题步骤
3. **通用解法（通法）**：总结这类题目的通用思路和步骤
4. **针对性学习建议**：基于此错误，给出复习建议

---
项目：MathMistakeAI
作者：Rookie
GitHub：https://github.com/error-T-T/MathMistakeAI
邮箱：RookieT@e.gzhu.edu.cn`;
                    navigator.clipboard.writeText(prompt);
                    setMessage('提示词已复制到剪贴板');
                    setTimeout(() => setMessage(''), 3000);
                  }}
                  className="btn btn-secondary"
                >
                  复制提示词
                </button>
                <div className="prompt-template">
{`你是一个数学导师。请分析以下学生的错题：

【题目ID】：{请填入题目ID}
【题目类型】：{请填入题目类型}
【题目内容】：{请填入题目内容}
【学生的错误过程或答案】：{请填入错误过程}
【正确答案】：{请填入正确答案}
【涉及知识点】：{请填入知识点标签}
【难度等级】：{请填入难度等级}

请分析错误原因并提供详细解析。

---
项目：MathMistakeAI
作者：Rookie
GitHub：https://github.com/error-T-T/MathMistakeAI
邮箱：RookieT@e.gzhu.edu.cn`}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowImportModal(false)} className="btn btn-secondary">
                取消
              </button>
              <button
                onClick={handleImportText}
                disabled={!importText.trim()}
                className="btn btn-primary"
              >
                导入文本
              </button>
              <button
                onClick={handleImportFile}
                disabled={!importFile}
                className="btn btn-primary"
              >
                导入文件
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MistakeManagementPage;
