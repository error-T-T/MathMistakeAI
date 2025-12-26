import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { Mistake } from '../types';

const HomePage: React.FC = () => {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(true);

  // 模拟近期错题数据
  const mockRecentMistakes = [
    { id: '1', question_id: 'Q001', question_content: '计算∫(0 to 1) x^2 dx', difficulty_level: '中等', knowledge_points: ['定积分', '微积分基本定理'] },
    { id: '2', question_id: 'Q002', question_content: '求解方程 x^2 + 2x + 1 = 0', difficulty_level: '简单', knowledge_points: ['一元二次方程', '因式分解'] },
    { id: '3', question_id: 'Q003', question_content: '求函数 f(x) = x^3 - 3x 的极值', difficulty_level: '困难', knowledge_points: ['导数', '极值', '单调性'] }
  ];

  useEffect(() => {
    // 实际应用中应该从API获取数据
    const fetchMistakes = async () => {
      try {
        const data = await apiService.getAllMistakes();
        setMistakes(data.slice(0, 3)); // 只显示最近3道错题
      } catch (error) {
        console.error('获取错题失败:', error);
        // 使用模拟数据作为 fallback
        setMistakes(mockRecentMistakes as Mistake[]);
      } finally {
        setLoading(false);
      }
    };

    fetchMistakes();
  }, []);

  const features = [
    {
      title: '错题导入',
      description: '支持粘贴或上传符合模板的错题文本文件',
      icon: '📥',
      path: '/mistakes/import'
    },
    {
      title: 'AI错题分析',
      description: '智能识别错误原因，提供详细解析和解题通法',
      icon: '🤖',
      path: '/mistakes/analysis'
    },
    {
      title: '智能题目生成',
      description: '根据错题生成相似题目，强化学习效果',
      icon: '📝',
      path: '/generate'
    },
    {
      title: '智能组卷与导出',
      description: '定制试卷，支持导出Word文档',
      icon: '📄',
      path: '/generate/exam'
    },
    {
      title: '数据统计分析',
      description: '可视化展示学习数据，发现薄弱环节',
      icon: '📊',
      path: '/statistics'
    }
  ];

  return (
    <div className="space-y-12">
      {/* 英雄区域 */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-4xl mx-auto"
      >
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
        >
          大学生数学错题智能分析系统
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-xl text-white/80 mb-10"
        >
          基于本地AI的个性化错题处理系统，帮助你高效学习数学
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link
            to="/mistakes"
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
          >
            开始使用
          </Link>
          <Link
            to="/generate"
            className="px-8 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-full font-semibold hover:bg-white/20 transition-all"
          >
            智能生成
          </Link>
        </motion.div>
      </motion.section>

      {/* 功能导航 */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <h2 className="text-3xl font-bold text-center mb-10">核心功能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 hover:border-white/40 transition-all"
            >
              <Link to={feature.path} className="block h-full">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 近期错题统计概览 */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20"
      >
        <h2 className="text-3xl font-bold mb-6">近期错题概览</h2>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="text-xl text-white/60">加载中...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {mistakes.length > 0 ? (
              mistakes.map((mistake) => (
                <motion.div
                  key={mistake.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg font-medium mb-1">{mistake.question_content}</div>
                      <div className="flex flex-wrap gap-2">
                        {mistake.knowledge_points.map((point, idx) => (
                          <span key={idx} className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded">
                            {point}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-500">{mistake.difficulty_level}</span>
                      <Link to={`/mistakes/${mistake.id}`} className="text-blue-300 hover:text-blue-200 transition-colors">
                        查看详情
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10 text-white/60">
                <p className="text-lg mb-4">暂无错题数据</p>
                <Link to="/mistakes" className="text-blue-300 hover:text-blue-200 transition-colors">
                  去导入错题
                </Link>
              </div>
            )}
          </div>
        )}
      </motion.section>

      {/* 系统简介 */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="max-w-4xl mx-auto text-center"
      >
        <h2 className="text-3xl font-bold mb-6">关于系统</h2>
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10">
          <p className="text-lg text-white/80 mb-4">
            MathMistakeAI 是一款基于本地AI的个性化数学错题分析系统，专为大学生设计。
          </p>
          <p className="text-lg text-white/80 mb-4">
            系统支持错题导入、智能分析、相似题目生成、智能组卷等功能，帮助你更好地掌握数学知识。
          </p>
          <p className="text-lg text-white/80">
            所有数据本地存储，保护你的隐私安全。
          </p>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;
