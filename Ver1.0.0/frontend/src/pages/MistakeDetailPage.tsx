import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { Mistake, AnalysisResult } from '../types';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const MistakeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [mistake, setMistake] = useState<Mistake | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  // 模拟错题数据
  const mockMistake: Mistake = {
    id: id || '1',
    question_id: 'Q001',
    question_type: '计算题',
    question_content: '计算∫(0 to 1) x^2 dx',
    wrong_process: '使用了基本积分公式，但忘记了代入上下限',
    wrong_answer: '1/3',
    correct_answer: '1/3',
    knowledge_points: ['定积分', '微积分基本定理'],
    difficulty_level: '中等'
  };

  // 模拟AI分析结果
  const mockAnalysis: AnalysisResult = {
    mistake_id: id || '1',
    formula_extraction: ['∫(0 to 1) x^2 dx'],
    error_type: '计算错误',
    error_reason: '忘记代入上下限',
    step_by_step_solution: [
      '应用积分公式 ∫x^n dx = \\frac{x^{n+1}}{n+1} + C',
      '计算不定积分 ∫x^2 dx = \\frac{x^3}{3} + C',
      '代入上下限计算定积分 \\frac{1^3}{3} - \\frac{0^3}{3} = \\frac{1}{3} - 0 = \\frac{1}{3}'
    ],
    general_method: '对于定积分问题，通常遵循以下步骤：找到被积函数的原函数，应用微积分基本定理代入上下限，计算差值。'
  };

  // 获取错题详情和AI分析结果
  useEffect(() => {
    const fetchMistakeAndAnalysis = async () => {
      try {
        setLoading(true);
        // 在实际应用中应该从API获取数据
        const mistakeData = await apiService.getMistakeById(id || '');
        setMistake(mistakeData);

        // 在实际应用中应该从API获取AI分析结果
        const analysisData = await apiService.analyzeMistake(id || '');
        setAnalysis(analysisData);
      } catch (error) {
        console.error('获取数据失败:', error);
        // 使用模拟数据作为 fallback
        setMistake(mockMistake);
        setAnalysis(mockAnalysis);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMistakeAndAnalysis();
    }
  }, [id]);

  // 渲染数学公式
  const renderMath = (text: string) => {
    // 检测是否包含数学公式
    if (text.includes('∫') || text.includes('dx') || text.includes('lim') || text.includes('\\')) {
      // 对于简单公式使用内联渲染，复杂公式使用块级渲染
      if (text.includes('\\frac') || text.includes('\\int')) {
        return <BlockMath math={text} />;
      } else {
        return <InlineMath math={text} />;
      }
    }
    return text;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-xl text-white/60">加载中...</div>
      </div>
    );
  }

  if (!mistake) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">❌</div>
        <h2 className="text-2xl font-semibold mb-2">错题不存在</h2>
        <p className="text-white/70 mb-6">未找到ID为 {id} 的错题</p>
        <Link to="/mistakes" className="bg-white/10 backdrop-blur-md rounded-lg px-6 py-3 border border-white/20 hover:bg-white/20 transition-colors">
          返回错题列表
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/mistakes"
              className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              ← 返回
            </Link>
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            错题详情
          </h1>
        </div>
        <p className="text-white/70">题目ID: {mistake.question_id}</p>
      </motion.div>

      {/* 题目信息卡片 */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 题目内容 */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">题目内容</h2>
            <div className="text-lg bg-white/5 rounded-lg p-6">
              <div className="min-h-[100px]">
                {renderMath(mistake.question_content.replace(/\((\d+)\s+to\s+(\d+)\)/g, '(\\$1 \\to \\$2)'))}
              </div>
            </div>
          </div>

          {/* 答案信息 */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-4">错误信息</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-red-300 font-semibold mb-2">错误过程</div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p>{mistake.wrong_process}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-red-300 font-semibold mb-2">错误答案</div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      {renderMath(mistake.wrong_answer)}
                    </div>
                  </div>
                  <div>
                    <div className="text-green-300 font-semibold mb-2">正确答案</div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      {renderMath(mistake.correct_answer)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 标签信息 */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">标签信息</h2>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300">{mistake.question_type}</span>
                {mistake.knowledge_points.map((point, index) => (
                  <span key={index} className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300">{point}</span>
                ))}
                <span className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-300">{mistake.difficulty_level}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI分析结果 */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
        <h2 className="text-2xl font-semibold mb-6">AI错题分析</h2>
        
        <div className="space-y-8">
          {/* 公式提取 */}
          {analysis && analysis.formula_extraction.length > 0 && (
            <div>
              <h3 className="text-xl font-medium mb-3 text-purple-300">公式提取</h3>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 flex flex-wrap gap-4">
                {analysis.formula_extraction.map((formula, index) => (
                  <div key={index} className="px-4 py-2 bg-white/5 rounded">
                    <BlockMath math={formula.replace(/\((\d+)\s+to\s+(\d+)\)/g, '(\\$1 \\to \\$2)')} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 错误类型诊断 */}
          {analysis && (
            <div>
              <h3 className="text-xl font-medium mb-3 text-blue-300">错误类型诊断</h3>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p>{analysis.error_type}：{analysis.error_reason}</p>
              </div>
            </div>
          )}

          {/* 逐步正确解析 */}
          {analysis && analysis.step_by_step_solution.length > 0 && (
            <div>
              <h3 className="text-xl font-medium mb-3 text-green-300">逐步正确解析</h3>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 space-y-4">
                {analysis.step_by_step_solution.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/30 flex items-center justify-center font-bold text-green-300">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      {step.includes('\\frac') || step.includes('\\int') ? (
                        <BlockMath math={step} />
                      ) : (
                        <p>{step}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 通用解法 */}
          {analysis && analysis.general_method && (
            <div>
              <h3 className="text-xl font-medium mb-3 text-blue-300">通用解法</h3>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p>{analysis.general_method}</p>
                {analysis.specific_strategy && (
                  <div className="mt-3">
                    <h4 className="font-semibold mb-1">特定策略：</h4>
                    <p>{analysis.specific_strategy}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 知识点强化建议 */}
          <div>
            <h3 className="text-xl font-medium mb-3 text-yellow-300">知识点强化建议</h3>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <ul className="list-disc list-inside ml-4 space-y-2">
                {mistake.knowledge_points.map((point, index) => (
                  <li key={index}>
                    <strong>{point}</strong>：建议多做相关类型的题目，特别是{mistake.difficulty_level}难度的练习题
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 相关功能按钮 */}
      <div className="flex gap-4 justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          生成相似题目
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          添加到复习计划
        </motion.button>
      </div>
    </div>
  );
};

export default MistakeDetailPage;