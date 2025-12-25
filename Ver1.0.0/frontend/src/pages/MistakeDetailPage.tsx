import React from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';

const MistakeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4">
          <Link
            to="/mistakes"
            className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
          >
            ← 返回
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            错题详情
          </h1>
        </div>
        <p className="text-white/70">题目ID: {id}</p>
      </motion.div>

      {/* 题目信息卡片 */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 题目内容 */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">题目内容</h2>
            <div className="text-lg bg-white/5 rounded-lg p-6">
              <p>计算∫(0 to 1) x^2 dx</p>
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
                    <p>使用了基本积分公式，但忘记了代入上下限</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-red-300 font-semibold mb-2">错误答案</div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      <p>1/3</p>
                    </div>
                  </div>
                  <div>
                    <div className="text-green-300 font-semibold mb-2">正确答案</div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <p>1/3</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 标签信息 */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">标签信息</h2>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300">计算题</span>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300">定积分</span>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300">微积分基本定理</span>
                <span className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-300">中等</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI分析结果 */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
        <h2 className="text-2xl font-semibold mb-6">AI错题分析</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-medium mb-3 text-blue-300">错误类型诊断</h3>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p>计算错误：忘记代入上下限</p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-3 text-green-300">逐步正确解析</h3>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 space-y-3">
              <p><strong>步骤1：</strong>应用积分公式 ∫x^n dx = (x^(n+1))/(n+1) + C</p>
              <p><strong>步骤2：</strong>计算不定积分 ∫x^2 dx = (x^3)/3 + C</p>
              <p><strong>步骤3：</strong>代入上下限计算定积分 (1^3)/3 - (0^3)/3 = 1/3 - 0 = 1/3</p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-3 text-purple-300">通用解法</h3>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <p>对于定积分问题，通常遵循以下步骤：</p>
              <ol className="list-decimal list-inside ml-4 mt-2 space-y-1">
                <li>找到被积函数的原函数</li>
                <li>应用微积分基本定理，代入上限和下限</li>
                <li>计算上下限处原函数的差值</li>
              </ol>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-3 text-yellow-300">解题策略</h3>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p>对于多项式函数的定积分，重点在于正确应用积分公式，并牢记代入上下限的步骤。可以使用"三步法"：</p>
              <ol className="list-decimal list-inside ml-4 mt-2 space-y-1">
                <li>识别积分类型和适用公式</li>
                <li>计算不定积分</li>
                <li>严格代入上下限计算</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MistakeDetailPage;