import React from 'react';
import { motion } from 'framer-motion';

const MistakeManagementPage: React.FC = () => {
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
            placeholder="搜索题目..."
            className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/20 focus:border-blue-400 focus:outline-none text-white placeholder:text-white/50"
          />
          <div className="flex gap-3">
            <select className="px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-blue-400 focus:outline-none">
              <option value="">所有类型</option>
              <option value="计算题">计算题</option>
              <option value="证明题">证明题</option>
              <option value="应用题">应用题</option>
            </select>
            <select className="px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-blue-400 focus:outline-none">
              <option value="">所有难度</option>
              <option value="简单">简单</option>
              <option value="中等">中等</option>
              <option value="困难">困难</option>
            </select>
          </div>
        </div>

        {/* 知识点标签筛选 */}
        <div className="mt-4 flex flex-wrap gap-2">
          {['定积分', '微积分基本定理', '导数', '极值', '一元二次方程'].map((tag) => (
            <button
              key={tag}
              className="px-4 py-2 rounded-full bg-white/5 border border-white/20 hover:bg-white/10 transition-colors text-sm"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 导入按钮 */}
      <div className="flex justify-end">
        <button className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-semibold transition-colors">
          导入错题
        </button>
      </div>

      {/* 错题卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* 暂时显示占位卡片 */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 h-64 flex items-center justify-center">
            <div className="text-white/50">错题卡片 {i}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MistakeManagementPage;
