import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { apiService } from '../services/apiService';
import { Statistics } from '../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const StatisticsPage: React.FC = () => {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 模拟数据（当API不可用时使用）
  const mockStatistics: Statistics = {
    recent_trend: [
      { date: '12/15', count: 3 },
      { date: '12/16', count: 5 },
      { date: '12/17', count: 2 },
      { date: '12/18', count: 7 },
      { date: '12/19', count: 4 },
      { date: '12/20', count: 6 },
      { date: '12/21', count: 3 }
    ],
    knowledge_distribution: [
      { name: '定积分', value: 15 },
      { name: '微积分基本定理', value: 12 },
      { name: '导数', value: 20 },
      { name: '极值', value: 8 },
      { name: '一元二次方程', value: 10 },
      { name: '其他', value: 15 }
    ],
    difficulty_distribution: [
      { name: '简单', value: 15 },
      { name: '中等', value: 35 },
      { name: '困难', value: 20 }
    ],
    total_mistakes: 70,
    average_difficulty: 2.3,
    most_common_error_types: ['计算错误', '概念理解错误', '方法选择不当']
  };

  // 获取统计数据
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const data = await apiService.getStatistics();
        setStatistics(data);
      } catch (error) {
        console.error('获取统计数据失败:', error);
        setStatistics(mockStatistics);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  // 难度颜色
  const getDifficultyColor = (name: string) => {
    switch (name) {
      case '简单': return '#10B981';
      case '中等': return '#F59E0B';
      case '困难': return '#EF4444';
      default: return '#8884d8';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
        />
        <p className="text-white/60">加载统计数据...</p>
      </div>
    );
  }

  const statData = statistics || mockStatistics;

  return (
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
          数据统计
        </h1>
        <p className="text-white/70">学习数据可视化分析</p>
      </motion.div>

      {/* 统计概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: '总错题数', value: statData.total_mistakes.toString(), icon: '📚', color: 'from-blue-500 to-blue-600' },
          { title: '知识点覆盖', value: '25+', icon: '🔖', color: 'from-purple-500 to-purple-600' },
          { title: '平均难度', value: statData.average_difficulty.toFixed(1), icon: '📊', color: 'from-green-500 to-green-600' }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 shadow-lg`}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm opacity-90 mb-1">{stat.title}</div>
                <div className="text-3xl font-bold">{stat.value}</div>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 常见错误类型 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
      >
        <h2 className="text-xl font-semibold mb-4">常见错误类型</h2>
        <div className="flex flex-wrap gap-3">
          {statData.most_common_error_types.map((errorType, index) => (
            <motion.span
              key={errorType}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-300 rounded-full"
            >
              {errorType}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* 近期错题趋势 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20"
      >
        <h2 className="text-2xl font-semibold mb-6">近期错题趋势</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={statData.recent_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.2)' }} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#8884d8"
                strokeWidth={3}
                dot={{ r: 5, fill: '#8884d8' }}
                activeDot={{ r: 8, fill: '#8884d8' }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 知识点分布和难度分布 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 知识点分布 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20"
        >
          <h2 className="text-2xl font-semibold mb-6">知识点分布</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statData.knowledge_distribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  animationDuration={1500}
                >
                  {statData.knowledge_distribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.2)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 难度分布 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20"
        >
          <h2 className="text-2xl font-semibold mb-6">难度分布</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statData.difficulty_distribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.7)" />
                <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.7)" width={60} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.2)' }} />
                <Bar
                  dataKey="value"
                  radius={[0, 4, 4, 0]}
                  animationDuration={1500}
                >
                  {statData.difficulty_distribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={getDifficultyColor(statData.difficulty_distribution[index].name)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* 底部统计说明 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold mb-3">学习建议</h3>
        <ul className="space-y-2 text-white/70">
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>根据知识点分布，建议重点复习「导数」和「定积分」相关内容</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-400">•</span>
            <span>中等难度题目占比较高，建议逐步提升解题能力</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-400">•</span>
            <span>注意减少「计算错误」，建议增加验算习惯</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
};

export default StatisticsPage;