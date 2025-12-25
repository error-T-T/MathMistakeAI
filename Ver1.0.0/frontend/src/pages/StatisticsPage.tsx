import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const StatisticsPage: React.FC = () => {
  // 模拟数据
  const recentTrendData = [
    { date: '12/15', count: 3 },
    { date: '12/16', count: 5 },
    { date: '12/17', count: 2 },
    { date: '12/18', count: 7 },
    { date: '12/19', count: 4 },
    { date: '12/20', count: 6 },
    { date: '12/21', count: 3 }
  ];

  const knowledgeDistributionData = [
    { name: '定积分', value: 15 },
    { name: '微积分基本定理', value: 12 },
    { name: '导数', value: 20 },
    { name: '极值', value: 8 },
    { name: '一元二次方程', value: 10 },
    { name: '其他', value: 15 }
  ];

  const difficultyDistributionData = [
    { name: '简单', value: 15 },
    { name: '中等', value: 35 },
    { name: '困难', value: 20 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

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
          { title: '总错题数', value: '70', icon: '📚', color: 'from-blue-500 to-blue-600' },
          { title: '知识点覆盖', value: '25+', icon: '🔖', color: 'from-purple-500 to-purple-600' },
          { title: '平均难度', value: '中等', icon: '📊', color: 'from-green-500 to-green-600' }
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

      {/* 近期错题趋势 */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
        <h2 className="text-2xl font-semibold mb-6">近期错题趋势</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={recentTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.2)' }} />
              <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 知识点分布和难度分布 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 知识点分布 */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold mb-6">知识点分布</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={knowledgeDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {knowledgeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.2)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 难度分布 */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold mb-6">难度分布</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={difficultyDistributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                <YAxis stroke="rgba(255,255,255,0.7)" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.2)' }} />
                <Bar dataKey="value">
                  {difficultyDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;