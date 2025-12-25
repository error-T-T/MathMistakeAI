import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

  // 模拟错题数据
  const mockMistakes: Mistake[] = [
    {
      id: '1',
      question_id: 'Q001',
      question_type: '计算题',
      question_content: '计算∫(0 to 1) x^2 dx',
      wrong_process: '使用了基本积分公式，但忘记了代入上下限',
      wrong_answer: '1/3',
      correct_answer: '1/3',
      knowledge_points: ['定积分', '微积分基本定理'],
      difficulty_level: '中等'
    },
    {
      id: '2',
      question_id: 'Q002',
      question_type: '证明题',
      question_content: '证明极限 lim(x→0) (sin x)/x = 1',
      wrong_process: '直接代入x=0，得到0/0，认为极限不存在',
      wrong_answer: '不存在',
      correct_answer: '1',
      knowledge_points: ['极限', '三角函数', '洛必达法则'],
      difficulty_level: '困难'
    },
    {
      id: '3',
      question_id: 'Q003',
      question_type: '应用题',
      question_content: '求解方程 x^2 + 2x + 1 = 0',
      wrong_process: '使用求根公式时计算错误',
      wrong_answer: 'x1=1, x2=-3',
      correct_answer: 'x=-1 (二重根)',
      knowledge_points: ['一元二次方程', '因式分解', '判别式'],
      difficulty_level: '简单'
    },
    {
      id: '4',
      question_id: 'Q004',
      question_type: '计算题',
      question_content: '求函数 f(x) = x^3 - 3x 的极值',
      wrong_process: '只找到了极大值点，忽略了极小值点',
      wrong_answer: '极大值为2，无极小值',
      correct_answer: '极大值为2，极小值为-2',
      knowledge_points: ['导数', '极值', '单调性'],
      difficulty_level: '困难'
    },
    {
      id: '5',
      question_id: 'Q005',
      question_type: '计算题',
      question_content: '计算矩阵 [[1, 2], [3, 4]] 的行列式',
      wrong_process: '行列式计算错误，使用了错误的公式',
      wrong_answer: '10',
      correct_answer: '-2',
      knowledge_points: ['线性代数', '矩阵', '行列式'],
      difficulty_level: '中等'
    }
  ];

  // 获取所有错题
  useEffect(() => {
    const fetchMistakes = async () => {
      try {
        setLoading(true);
        const data = await apiService.getAllMistakes();
        setMistakes(data.length > 0 ? data : mockMistakes);
      } catch (error) {
        console.error('获取错题失败:', error);
        // 使用模拟数据作为 fallback
        setMistakes(mockMistakes);
      } finally {
        setLoading(false);
      }
    };

    fetchMistakes();
  }, []);

  // 过滤错题
  useEffect(() => {
    let result = [...mistakes];

    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(mistake =>
        mistake.question_content.toLowerCase().includes(term) ||
        mistake.question_id.toLowerCase().includes(term) ||
        mistake.knowledge_points.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // 类型过滤
    if (selectedType) {
      result = result.filter(mistake => mistake.question_type === selectedType);
    }

    // 难度过滤
    if (selectedDifficulty) {
      result = result.filter(mistake => mistake.difficulty_level === selectedDifficulty);
    }

    // 标签过滤
    if (selectedTags.length > 0) {
      result = result.filter(mistake =>
        selectedTags.every(tag => mistake.knowledge_points.includes(tag))
      );
    }

    setFilteredMistakes(result);
  }, [mistakes, searchTerm, selectedType, selectedDifficulty, selectedTags]);

  // 处理标签选择
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // 获取所有可用标签
  const getAllTags = () => {
    const tags = new Set<string>();
    mistakes.forEach(mistake => {
      mistake.knowledge_points.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  };

  // 处理导入文本
  const handleImportText = async () => {
    try {
      if (!importText.trim()) return;
      await apiService.importText(importText);
      // 重新获取错题列表
      const data = await apiService.getAllMistakes();
      setMistakes(data.length > 0 ? data : mockMistakes);
      setImportText('');
      setShowImportModal(false);
    } catch (error) {
      console.error('导入文本失败:', error);
      alert('导入失败，请检查格式是否正确');
    }
  };

  // 处理导入文件
  const handleImportFile = async () => {
    try {
      if (!importFile) return;
      await apiService.importFile(importFile);
      // 重新获取错题列表
      const data = await apiService.getAllMistakes();
      setMistakes(data.length > 0 ? data : mockMistakes);
      setImportFile(null);
      setShowImportModal(false);
    } catch (error) {
      console.error('导入文件失败:', error);
      alert('导入失败，请检查文件格式是否正确');
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
          错题管理
        </h1>
        <p className="text-white/70">管理和查看所有导入的错题</p>
      </motion.div>

      {/* 搜索和筛选区域 */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="搜索题目、ID或知识点..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/20 focus:border-blue-400 focus:outline-none text-white placeholder:text-white/50"
          />
          <div className="flex gap-3">
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-blue-400 focus:outline-none"
            >
              <option value="">所有类型</option>
              <option value="计算题">计算题</option>
              <option value="证明题">证明题</option>
              <option value="应用题">应用题</option>
            </select>
            <select 
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-blue-400 focus:outline-none"
            >
              <option value="">所有难度</option>
              <option value="简单">简单</option>
              <option value="中等">中等</option>
              <option value="困难">困难</option>
            </select>
          </div>
        </div>

        {/* 知识点标签筛选 */}
        <div className="mt-4 flex flex-wrap gap-2">
          {getAllTags().map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${selectedTags.includes(tag) ? 'bg-blue-500/30 border border-blue-500/50' : 'bg-white/5 border border-white/20 hover:bg-white/10'}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 导入按钮 */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowImportModal(true)}
          className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          导入错题
        </motion.button>
      </div>

      {/* 错题卡片网格 */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-white/60">加载中...</div>
        </div>
      ) : filteredMistakes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMistakes.map((mistake) => (
            <MistakeCard key={mistake.id} mistake={mistake} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-2xl font-semibold mb-2">未找到匹配的错题</h3>
          <p className="text-white/70 mb-6">请尝试调整搜索条件或导入新的错题</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedType('');
              setSelectedDifficulty('');
              setSelectedTags([]);
            }}
            className="bg-white/10 backdrop-blur-md rounded-lg px-6 py-3 border border-white/20 hover:bg-white/20 transition-colors"
          >
            清除筛选条件
          </button>
        </div>
      )}

      {/* 导入模态框 */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-xl p-8 border border-white/20 w-full max-w-3xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">导入错题</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* 文本导入 */}
              <div>
                <h3 className="text-lg font-medium mb-3">粘贴文本</h3>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="请粘贴符合模板的错题文本..."
                  className="w-full h-40 px-4 py-3 rounded-lg bg-white/5 border border-white/20 focus:border-blue-400 focus:outline-none text-white placeholder:text-white/50"
                />
                <div className="text-sm text-white/50 mt-2">
                  支持的模板格式：[题目ID] Q001
[题目类型] 计算题
[题目内容] 计算∫(0 to 1) x^2 dx
[错误过程] ...
[错误答案] ...
[正确答案] ...
[知识点标签] ...
[难度等级] ...
                </div>
              </div>

              {/* 文件导入 */}
              <div>
                <h3 className="text-lg font-medium mb-3">上传文件</h3>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept=".txt"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="import-file"
                  />
                  <label htmlFor="import-file" className="cursor-pointer">
                    <div className="text-4xl mb-2">📁</div>
                    <div className="font-medium mb-1">选择或拖拽.txt文件</div>
                    <div className="text-sm text-white/50">支持txt格式文件，最大2MB</div>
                  </label>
                  {importFile && (
                    <div className="mt-4 p-2 bg-white/10 rounded-lg inline-block">
                      <span className="text-sm">已选择：{importFile.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 导入按钮 */}
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
                >
                  取消
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={handleImportText}
                    disabled={!importText.trim()}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors ${!importText.trim() ? 'bg-blue-500/50 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                  >
                    导入文本
                  </button>
                  <button
                    onClick={handleImportFile}
                    disabled={!importFile}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors ${!importFile ? 'bg-green-500/50 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                  >
                    导入文件
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MistakeManagementPage;
