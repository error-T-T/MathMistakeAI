import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '../services/apiService';
import { Mistake, GeneratedQuestion } from '../types';
import { ResponsiveContainer, BarChart, Bar, Cell, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

interface PaperQuestion {
  id: string;
  question_number: number;
  question_text: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  knowledge_points: string[];
  source_id: string;
}

const GenerationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'questions' | 'paper'>('questions');
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [selectedMistakeId, setSelectedMistakeId] = useState<string>('');
  const [similarity, setSimilarity] = useState<'only_numbers' | 'same_type' | 'mixed_knowledge'>('same_type');
  const [quantity, setQuantity] = useState(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedKnowledgePoints, setSelectedKnowledgePoints] = useState<string[]>([]);
  const [paperTitle, setPaperTitle] = useState('数学练习卷');
  const [questionCount, setQuestionCount] = useState(10);
  const [difficultyDistribution, setDifficultyDistribution] = useState({ easy: 3, medium: 5, hard: 2 });
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewGenerated, setPreviewGenerated] = useState(false);
  const [paperQuestions, setPaperQuestions] = useState<PaperQuestion[]>([]);
  const [paperStats, setPaperStats] = useState({ easy: 0, medium: 0, hard: 0 });

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
      question_type: '计算题',
      question_content: '求函数 f(x) = x^3 - 3x 的极值',
      wrong_process: '只找到了极大值点，忽略了极小值点',
      wrong_answer: '极大值为2，无极小值',
      correct_answer: '极大值为2，极小值为-2',
      knowledge_points: ['导数', '极值', '单调性'],
      difficulty_level: '困难'
    },
    {
      id: '3',
      question_id: 'Q003',
      question_type: '计算题',
      question_content: '求解方程 x^2 + 2x + 1 = 0',
      wrong_process: '使用求根公式时计算错误',
      wrong_answer: 'x1=1, x2=-3',
      correct_answer: 'x=-1 (二重根)',
      knowledge_points: ['一元二次方程', '因式分解', '判别式'],
      difficulty_level: '简单'
    }
  ];

  // 获取错题列表
  useEffect(() => {
    const fetchMistakes = async () => {
      try {
        const data = await apiService.getAllMistakes();
        setMistakes(data.length > 0 ? data : mockMistakes);
        if (data.length > 0 || mockMistakes.length > 0) {
          const firstMistake = data.length > 0 ? data[0] : mockMistakes[0];
          setSelectedMistakeId(firstMistake.id);
          
          // 设置默认选中的知识点
          if (firstMistake.knowledge_points.length > 0) {
            setSelectedKnowledgePoints([firstMistake.knowledge_points[0]]);
          }
        }
      } catch (error) {
        console.error('获取错题失败:', error);
        setMistakes(mockMistakes);
        if (mockMistakes.length > 0) {
          setSelectedMistakeId(mockMistakes[0].id);
          if (mockMistakes[0].knowledge_points.length > 0) {
            setSelectedKnowledgePoints([mockMistakes[0].knowledge_points[0]]);
          }
        }
      }
    };

    fetchMistakes();
  }, []);

  // 获取所有知识点
  const getAllKnowledgePoints = () => {
    const points = new Set<string>();
    mistakes.forEach(mistake => {
      mistake.knowledge_points.forEach(point => points.add(point));
    });
    return Array.from(points);
  };

  // 处理知识点选择
  const toggleKnowledgePoint = (point: string) => {
    if (selectedKnowledgePoints.includes(point)) {
      setSelectedKnowledgePoints(selectedKnowledgePoints.filter(p => p !== point));
    } else {
      setSelectedKnowledgePoints([...selectedKnowledgePoints, point]);
    }
  };

  // 生成题目
  const handleGenerateQuestions = async () => {
    try {
      setIsGenerating(true);

      // 调用后端 API 生成题目
      const response = await apiService.generateQuestions({
        similarity,
        quantity,
        difficulty,
        knowledge_points: selectedKnowledgePoints,
        base_mistake_id: selectedMistakeId
      });

      // 将后端返回的题目数据转换为前端使用的格式
      if (response.success && response.questions) {
        const formattedQuestions: GeneratedQuestion[] = response.questions.map((q: any, index: number) => ({
          id: q.question_id || `gen-${Date.now()}-${index}`,
          source_mistake_id: q.source_mistake_id || selectedMistakeId,
          question_text: q.question_content,
          answer: q.solution,
          difficulty: q.difficulty,
          knowledge_points: q.knowledge_points,
          similarity_level: q.generation_method === '仅改数字' ? '高' : 
                           q.generation_method === '同类型变形' ? '中' : '低'
        }));
        
        setGeneratedQuestions(formattedQuestions);
        setPreviewGenerated(true);
      } else {
        throw new Error(response.message || '生成失败');
      }
    } catch (error) {
      console.error('生成题目失败:', error);
      alert('生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  // 重置预览
  const handleResetPreview = () => {
    setGeneratedQuestions([]);
    setPaperQuestions([]);
    setPreviewGenerated(false);
  };

  // 生成试卷
  const handleGeneratePaper = async () => {
    try {
      setIsGenerating(true);

      // 模拟生成结果
      await new Promise(resolve => setTimeout(resolve, 2000));

      const easyQuestions = difficultyDistribution.easy;
      const mediumQuestions = difficultyDistribution.medium;
      const hardQuestions = difficultyDistribution.hard;

      // 生成题目列表
      const questions: PaperQuestion[] = [];
      let questionNum = 1;

      // 生成简单题
      for (let i = 0; i < easyQuestions; i++) {
        questions.push(generatePaperQuestion(questionNum, 'easy'));
        questionNum++;
      }

      // 生成中等题
      for (let i = 0; i < mediumQuestions; i++) {
        questions.push(generatePaperQuestion(questionNum, 'medium'));
        questionNum++;
      }

      // 生成困难题
      for (let i = 0; i < hardQuestions; i++) {
        questions.push(generatePaperQuestion(questionNum, 'hard'));
        questionNum++;
      }

      setPaperQuestions(questions);
      setPaperStats({
        easy: easyQuestions,
        medium: mediumQuestions,
        hard: hardQuestions
      });
      setPreviewGenerated(true);
    } catch (error) {
      console.error('生成试卷失败:', error);
      alert('生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  // 生成试卷中的单道题目
  const generatePaperQuestion = (num: number, diff: 'easy' | 'medium' | 'hard'): PaperQuestion => {
    const questionTemplates = {
      easy: [
        { text: '计算 ∫₀¹ x² dx', answer: '1/3', points: ['定积分', '微积分基本定理'] },
        { text: '求极限 lim(x→0) (sin x)/x', answer: '1', points: ['极限', '等价无穷小'] },
        { text: '求导数 d/dx (x³)', answer: '3x²', points: ['导数', '幂函数'] },
        { text: '求解方程 x² - 4 = 0', answer: 'x = ±2', points: ['一元二次方程', '因式分解'] },
        { text: '计算 2 + 3 × 4', answer: '14', points: ['四则运算'] }
      ],
      medium: [
        { text: '求函数 f(x) = x³ - 3x 的极值', answer: '极大值 2，极小值 -2', points: ['导数', '极值', '单调性'] },
        { text: '计算 ∫₀¹ (2x + 1) dx', answer: '2', points: ['定积分', '线性函数'] },
        { text: '求极限 lim(x→∞) (2x² + 1)/(x² - 3x)', answer: '2', points: ['极限', '无穷大'] },
        { text: '求函数 f(x) = e^x 在 x=0 处的切线', answer: 'y = x + 1', points: ['导数', '切线方程'] },
        { text: '计算 ∫₁² x ln x dx', answer: '(2ln2 - 3/4)', points: ['定积分', '分部积分'] }
      ],
      hard: [
        { text: '求曲线 y = x³ + x² 在点 (1, 2) 处的曲率', answer: '6√10/125', points: ['导数', '曲率', '二阶导数'] },
        { text: '计算 ∫₀^∞ e^(-x²) dx', answer: '√π/2', points: ['广义积分', '高斯积分'] },
        { text: '证明: lim(x→0) (sin x - x)/x³ = -1/6', answer: '证明过程', points: ['极限', '泰勒展开'] },
        { text: '求解微分方程 y\'\' + 4y = 0', answer: 'y = C₁cos2x + C₂sin2x', points: ['微分方程', '特征方程'] },
        { text: '求级数 ∑(n=1)^∞ (-1)^(n+1)/n 的和', answer: 'ln 2', points: ['级数', '调和级数'] }
      ]
    };

    const template = questionTemplates[diff][Math.floor(Math.random() * questionTemplates[diff].length)];
    const sourceMistake = mistakes[Math.floor(Math.random() * Math.max(mistakes.length, 1))];

    return {
      id: `paper-${Date.now()}-${num}`,
      question_number: num,
      question_text: template.text,
      answer: template.answer,
      difficulty: diff,
      knowledge_points: template.points,
      source_id: sourceMistake?.id || 'generated'
    };
  };

  // 获取难度颜色
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-500/20 border-green-500/50 text-green-300';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      case 'hard': return 'bg-red-500/20 border-red-500/50 text-red-300';
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
    }
  };

  // 获取难度标签
  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case 'easy': return '简单';
      case 'medium': return '中等';
      case 'hard': return '困难';
      default: return diff;
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
          智能生成
        </h1>
        <p className="text-white/70">生成相似题目和定制试卷</p>
      </motion.div>

      {/* 选项卡切换 */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${activeTab === 'questions' ? 'bg-blue-500/30 border border-blue-500/50' : 'bg-white/5 border border-white/20 hover:bg-white/10'}`}
          >
            生成题目
          </button>
          <button
            onClick={() => setActiveTab('paper')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${activeTab === 'paper' ? 'bg-blue-500/30 border border-blue-500/50' : 'bg-white/5 border border-white/20 hover:bg-white/10'}`}
          >
            生成试卷
          </button>
        </div>
      </div>

      {/* 参数配置面板 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold mb-6">
              {activeTab === 'questions' ? '生成参数' : '试卷参数'}
            </h2>

            {/* 选择基础错题 */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">基础错题</h3>
              <select
                value={selectedMistakeId}
                onChange={(e) => setSelectedMistakeId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-blue-400 focus:outline-none"
              >
                {mistakes.map((mistake) => (
                  <option key={mistake.id} value={mistake.id}>
                    {mistake.question_id}: {mistake.question_content.substring(0, 20)}...
                  </option>
                ))}
              </select>
            </div>

            {activeTab === 'questions' ? (
              <>
                {/* 相似度选项 */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">相似度</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'only_numbers', label: '仅改数字', desc: '题目结构完全相同，仅改变数字参数' },
                      { value: 'same_type', label: '同类型变形', desc: '保持解题方法相同，改变题目形式' },
                      { value: 'mixed_knowledge', label: '混合知识点', desc: '结合多个知识点，综合考查' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="similarity"
                          value={option.value}
                          checked={similarity === option.value}
                          onChange={(e) => setSimilarity(e.target.value as 'only_numbers' | 'same_type' | 'mixed_knowledge')}
                          className="w-4 h-4 mt-1 text-blue-500"
                        />
                        <div>
                          <span>{option.label}</span>
                          <p className="text-xs text-white/50">{option.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 数量选择 */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">生成数量: {quantity}</h3>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-white/50 mt-2">
                    <span>1</span>
                    <span>50</span>
                  </div>
                </div>

                {/* 难度选择 */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">难度</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {['easy', 'medium', 'hard'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level as 'easy' | 'medium' | 'hard')}
                        className={`py-2 rounded-lg border transition-all ${
                          difficulty === level
                            ? 'bg-blue-500/30 border-blue-500/50 text-blue-300'
                            : 'bg-white/5 border-white/20 hover:bg-white/10'
                        }`}
                      >
                        {level === 'easy' ? '简单' : level === 'medium' ? '中等' : '困难'}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* 试卷标题 */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">试卷标题</h3>
                  <input
                    type="text"
                    value={paperTitle}
                    onChange={(e) => setPaperTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-blue-400 focus:outline-none"
                  />
                </div>

                {/* 题目数量 */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">题目数量: {questionCount}</h3>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                {/* 难度分布 */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">难度分布</h3>
                  <div className="space-y-3">
                    {['easy', 'medium', 'hard'].map((level) => (
                      <div key={level} className="flex items-center gap-4">
                        <span className="w-16 text-sm">
                          {level === 'easy' ? '简单' : level === 'medium' ? '中等' : '困难'}
                        </span>
                        <input
                          type="number"
                          min="0"
                          max={questionCount}
                          value={difficultyDistribution[level as keyof typeof difficultyDistribution]}
                          onChange={(e) => setDifficultyDistribution({
                            ...difficultyDistribution,
                            [level]: parseInt(e.target.value) || 0
                          })}
                          className="w-20 px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white text-center focus:border-blue-400 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 知识点选择 */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">知识点</h3>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {getAllKnowledgePoints().map((point) => (
                  <label key={point} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedKnowledgePoints.includes(point)}
                      onChange={() => toggleKnowledgePoint(point)}
                      className="w-4 h-4 text-blue-500"
                    />
                    <span>{point}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 生成按钮 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={activeTab === 'questions' ? handleGenerateQuestions : handleGeneratePaper}
              disabled={isGenerating || selectedMistakeId.length === 0}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                isGenerating || selectedMistakeId.length === 0
                  ? 'bg-gray-500/50 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isGenerating ? '生成中...' : activeTab === 'questions' ? '生成题目' : '生成试卷'}
            </motion.button>
          </div>
        </div>

        {/* 实时预览区 */}
        <div className="lg:col-span-2">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                {activeTab === 'questions' ? '生成结果预览' : '试卷预览'}
              </h2>
              {previewGenerated && (
                <button
                  onClick={handleResetPreview}
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  清除预览
                </button>
              )}
            </div>

            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-64">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
                />
                <p className="text-white/60">AI正在生成中...</p>
              </div>
            ) : previewGenerated ? (
              <div className="space-y-4">
                {activeTab === 'questions' ? (
                  <>
                    {/* 生成统计 */}
                    <div className="flex gap-4 mb-6">
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-4 py-2">
                        <span className="text-blue-300">共生成 </span>
                        <span className="text-xl font-bold text-blue-300">{generatedQuestions.length}</span>
                        <span className="text-blue-300"> 道题目</span>
                      </div>
                      <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg px-4 py-2">
                        <span className="text-purple-300">相似度: </span>
                        <span className="text-purple-300 font-bold">
                          {similarity === 'only_numbers' ? '高' : similarity === 'same_type' ? '中' : '低'}
                        </span>
                      </div>
                    </div>

                    {/* 题目列表 */}
                    {generatedQuestions.map((question, index) => (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/5 rounded-lg p-6 border border-white/20 hover:border-white/40 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 bg-blue-500/20 border border-blue-500/50 rounded-full flex items-center justify-center text-sm font-bold text-blue-300">
                              {index + 1}
                            </span>
                            <span className="text-sm text-blue-300 font-mono">{question.similarity_level}相似度</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${getDifficultyColor(question.difficulty)}`}>
                            {getDifficultyLabel(question.difficulty)}
                          </span>
                        </div>

                        <div className="mb-4">
                          <div className="text-lg">{question.question_text}</div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {question.knowledge_points.map((point, idx) => (
                            <span key={idx} className="bg-purple-500/20 border border-purple-500/50 text-purple-300 text-xs px-2 py-1 rounded-full">
                              {point}
                            </span>
                          ))}
                        </div>

                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                          <span className="text-green-300 font-semibold text-sm">答案: </span>
                          <span className="text-green-300">{question.answer}</span>
                        </div>
                      </motion.div>
                    ))}
                  </>
                ) : (
                  <>
                    {/* 试卷预览 */}
                    <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6 mb-6">
                      <h3 className="text-2xl font-bold text-center mb-2">{paperTitle}</h3>
                      <div className="flex justify-center gap-6 text-sm text-white/70">
                        <span>题目总数: {paperQuestions.length}</span>
                        <span>简单: {paperStats.easy}题</span>
                        <span>中等: {paperStats.medium}题</span>
                        <span>困难: {paperStats.hard}题</span>
                      </div>
                    </div>

                    {/* 难度分布图表 */}
                    <div className="h-48 mb-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: '简单', value: paperStats.easy, fill: '#10B981' },
                            { name: '中等', value: paperStats.medium, fill: '#F59E0B' },
                            { name: '困难', value: paperStats.hard, fill: '#EF4444' }
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                          <YAxis stroke="rgba(255,255,255,0.7)" />
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.2)' }} />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {[
                              { name: '简单', value: paperStats.easy, fill: '#10B981' },
                              { name: '中等', value: paperStats.medium, fill: '#F59E0B' },
                              { name: '困难', value: paperStats.hard, fill: '#EF4444' }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* 试卷题目列表 */}
                    <div className="space-y-4">
                      {paperQuestions.map((question, index) => (
                        <motion.div
                          key={question.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white/5 rounded-lg p-5 border border-white/20 hover:border-white/40 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-sm font-bold text-white">
                                {question.question_number}
                              </span>
                              <span className="text-xs text-white/50">
                                关联错题: {question.source_id === 'generated' ? '生成题目' : question.source_id}
                              </span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getDifficultyColor(question.difficulty)}`}>
                              {getDifficultyLabel(question.difficulty)}
                            </span>
                          </div>

                          <div className="text-lg mb-3">{question.question_text}</div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {question.knowledge_points.map((point, idx) => (
                              <span key={idx} className="bg-purple-500/20 border border-purple-500/50 text-purple-300 text-xs px-2 py-1 rounded-full">
                                {point}
                              </span>
                            ))}
                          </div>

                          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                            <span className="text-green-300 font-semibold text-sm">参考答案: </span>
                            <span className="text-green-300">{question.answer}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}

                {/* 导出按钮 */}
                <div className="flex gap-4 justify-end mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg font-semibold hover:bg-white/20 transition-colors"
                  >
                    保存到题库
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition-colors"
                  >
                    导出为Word
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">还没有生成内容</h3>
                <p className="text-white/60 mb-4">请在左侧配置参数，然后点击生成按钮</p>
                <div className="text-sm text-white/40">
                  <p>支持配置：</p>
                  <p>• 相似度级别（仅改数字、同类型变形、混合知识点）</p>
                  <p>• 生成数量（1-50题）</p>
                  <p>• 难度级别（简单、中等、困难）</p>
                  <p>• 知识点覆盖范围</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerationPage;