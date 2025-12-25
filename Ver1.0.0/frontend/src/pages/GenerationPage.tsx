import React from 'react';
import { motion } from 'framer-motion';

const GenerationPage: React.FC = () => {
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
          <button className="flex-1 py-3 px-6 rounded-lg bg-blue-500/30 border border-blue-500/50 font-medium">
            生成题目
          </button>
          <button className="flex-1 py-3 px-6 rounded-lg bg-white/5 border border-white/20 font-medium hover:bg-white/10 transition-colors">
            生成试卷
          </button>
        </div>
      </div>

      {/* 参数配置面板 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold mb-6">生成参数</h2>

            {/* 相似度选项 */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">相似度</h3>
              <div className="space-y-2">
                {[
                  { value: 'only_numbers', label: '仅改数字' },
                  { value: 'same_type', label: '同类型变形' },
                  { value: 'mixed_knowledge', label: '混合知识点' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="similarity"
                      value={option.value}
                      className="w-4 h-4 text-blue-500"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 数量选择 */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">生成数量: 5</h3>
              <input
                type="range"
                min="1"
                max="50"
                defaultValue="5"
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
              <select className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-blue-400 focus:outline-none">
                <option value="medium">中等</option>
                <option value="easy">简单</option>
                <option value="hard">困难</option>
              </select>
            </div>

            {/* 知识点选择 */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">知识点</h3>
              <div className="space-y-2">
                {['定积分', '微积分基本定理', '导数', '极值', '一元二次方程'].map((point) => (
                  <label key={point} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      value={point}
                      className="w-4 h-4 text-blue-500"
                    />
                    <span>{point}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 生成按钮 */}
            <button className="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition-colors">
              生成题目
            </button>
          </div>
        </div>

        {/* 实时预览区 */}
        <div className="lg:col-span-2">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold mb-6">生成结果预览</h2>
            <div className="space-y-6">
              {/* 生成的题目 */}
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white/5 rounded-lg p-6 border border-white/20">
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-sm text-blue-300 font-mono">生成题 {i}</div>
                    <div className="px-2 py-1 rounded-full text-xs font-bold bg-blue-500">中等</div>
                  </div>
                  <div className="text-lg mb-4">计算∫(0 to 2) x^3 dx</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-purple-500/20 border border-purple-500/50 text-purple-300 text-xs px-2 py-1 rounded-full">
                      定积分
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerationPage;