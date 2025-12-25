import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mistake } from '../types';

interface MistakeCardProps {
  mistake: Mistake;
}

const MistakeCard: React.FC<MistakeCardProps> = ({ mistake }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '简单':
        return 'bg-green-500';
      case '中等':
        return 'bg-yellow-500';
      case '困难':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}
      transition={{ duration: 0.3 }}
      className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all"
    >
      <Link to={`/mistakes/${mistake.id}`} className="block h-full">
        {/* 题目ID和难度 */}
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-blue-300 font-mono">{mistake.question_id}</div>
          <div className={`px-2 py-1 rounded-full text-xs font-bold ${getDifficultyColor(mistake.difficulty_level)}`}>
            {mistake.difficulty_level}
          </div>
        </div>

        {/* 题目类型 */}
        <div className="text-sm text-white/70 mb-2">{mistake.question_type}</div>

        {/* 题目内容（限制显示长度） */}
        <div className="text-lg font-medium mb-4 line-clamp-2">{mistake.question_content}</div>

        {/* 错误答案和正确答案 */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div className="bg-red-500/20 border border-red-500/50 rounded p-2">
            <div className="text-red-400 font-semibold mb-1">错误答案</div>
            <div>{mistake.wrong_answer}</div>
          </div>
          <div className="bg-green-500/20 border border-green-500/50 rounded p-2">
            <div className="text-green-400 font-semibold mb-1">正确答案</div>
            <div>{mistake.correct_answer}</div>
          </div>
        </div>

        {/* 知识点标签 */}
        <div className="flex flex-wrap gap-2">
          {mistake.knowledge_points.map((point, index) => (
            <span key={index} className="bg-purple-500/20 border border-purple-500/50 text-purple-300 text-xs px-2 py-1 rounded-full">
              {point}
            </span>
          ))}
        </div>
      </Link>
    </motion.div>
  );
};

export default MistakeCard;
