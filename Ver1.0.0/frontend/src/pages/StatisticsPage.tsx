import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { apiService } from '../services/apiService';
import { Statistics } from '../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const StatisticsPage: React.FC = () => {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const data = await apiService.getStatistics();
        setStatistics(data);
        setHasData(true);
        setErrorMessage(null);
      } catch (err) {
        console.error('获取统计数据失败:', err);
        setErrorMessage('无法加载统计数据，请检查后端服务是否运行');
        setHasData(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, []);

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

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">加载失败</h2>
          <p className="text-white/60">{errorMessage}</p>
        </motion.div>
      </div>
    );
  }

  if (!hasData || !statistics) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-white/80 mb-2">暂无统计数据</h2>
          <p className="text-white/60">请先导入错题数据后，再查看统计分析</p>
        </motion.div>
      </div>
    );
  }

  const recentTrend = statistics.recent_trend || [];
  const knowledgeDist = statistics.knowledge_distribution || [];
  const difficultyDist = statistics.difficulty_distribution || [];

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

      {recentTrend.length === 0 && knowledgeDist.length === 0 && difficultyDist.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-white/60">暂无数据</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentTrend.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm opacity-90 mb-1">总错题数</div>
                    <div className="text-3xl font-bold">{statistics.total_mistakes || 0}</div>
                  </div>
                  <div className="text-4xl">📚</div>
                </div>
              </motion.div>
            )}

            {knowledgeDist.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm opacity-90 mb-1">知识点覆盖</div>
                    <div className="text-3xl font-bold">{knowledgeDist.length}+</div>
                  </div>
                  <div className="text-4xl">🔖</div>
                </div>
              </motion.div>
            )}

            {difficultyDist.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm opacity-90 mb-1">平均难度</div>
                    <div className="text-3xl font-bold">{(statistics.average_difficulty || 0).toFixed(1)}</div>
                  </div>
                  <div className="text-4xl">📊</div>
                </div>
              </motion.div>
            )}
          </div>

          {statistics.most_common_error_types && statistics.most_common_error_types.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
            >
              <h2 className="text-xl font-semibold mb-4">常见错误类型</h2>
              <div className="flex flex-wrap gap-3">
                {statistics.most_common_error_types.map((errorType, index) => (
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
          )}

          {recentTrend.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20"
            >
              <h2 className="text-2xl font-semibold mb-6">近期错题趋势</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={recentTrend}>
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
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {knowledgeDist.length > 0 && (
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
                        data={knowledgeDist}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        animationDuration={1500}
                      >
                        {knowledgeDist.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.2)' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {difficultyDist.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20"
              >
                <h2 className="text-2xl font-semibold mb-6">难度分布</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={difficultyDist} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis type="number" stroke="rgba(255,255,255,0.7)" />
                      <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.7)" width={60} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.2)' }} />
                      <Bar
                        dataKey="value"
                        radius={[0, 4, 4, 0]}
                        animationDuration={1500}
                      >
                        {difficultyDist.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={getDifficultyColor(difficultyDist[index].name)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StatisticsPage;
