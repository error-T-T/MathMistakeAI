import { motion } from 'framer-motion'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts'
import { TrendingUp, BookOpen, BarChart3, PieChart as PieChartIcon, Calendar, Target, AlertCircle } from 'lucide-react'
import { useState } from 'react'

// 模拟数据 - 近期错题趋势（过去30天）
const mistakeTrendData = [
  { date: '12-01', count: 5, avgDifficulty: 2.8 },
  { date: '12-05', count: 8, avgDifficulty: 3.2 },
  { date: '12-10', count: 12, avgDifficulty: 3.5 },
  { date: '12-15', count: 7, avgDifficulty: 2.9 },
  { date: '12-20', count: 10, avgDifficulty: 3.1 },
  { date: '12-25', count: 6, avgDifficulty: 2.7 },
  { date: '12-30', count: 9, avgDifficulty: 3.3 },
]

// 知识点分布数据
const knowledgeDistributionData = [
  { name: '定积分', value: 28, color: '#3B82F6' },
  { name: '极限', value: 22, color: '#10B981' },
  { name: '导数应用', value: 18, color: '#8B5CF6' },
  { name: '微分方程', value: 15, color: '#F59E0B' },
  { name: '矩阵运算', value: 12, color: '#EF4444' },
  { name: '级数', value: 5, color: '#6366F1' },
]

// 难度分布数据
const difficultyData = [
  { level: '简单', count: 15, color: '#10B981' },
  { level: '中等', count: 42, color: '#F59E0B' },
  { level: '困难', count: 18, color: '#EF4444' },
]

// 统计卡片数据
const statCards = [
  { title: '总错题数', value: '75', change: '+12%', icon: BookOpen, color: 'from-tech-blue-500 to-tech-blue-600' },
  { title: '本月新增', value: '15', change: '+5%', icon: TrendingUp, color: 'from-green-500 to-green-600' },
  { title: '平均难度', value: '3.2', change: '-0.3', icon: Target, color: 'from-purple-500 to-purple-600' },
  { title: '知识漏洞', value: '8', change: '-2', icon: AlertCircle, color: 'from-red-500 to-red-600' },
]

const StatsPage = () => {
  const [activeChart, setActiveChart] = useState<'trend' | 'knowledge' | 'difficulty'>('trend')

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">数据统计</h1>
        <p className="text-gray-600 dark:text-gray-400">
          可视化分析你的错题数据，发现学习规律与知识漏洞
        </p>
      </motion.div>

      {/* 统计卡片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{card.value}</p>
                  <p className={`text-sm mt-1 ${card.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {card.change} 上月
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-gradient-to-br ${card.color} bg-opacity-10`}>
                  <Icon className="h-6 w-6 text-current" />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 近期错题趋势折线图 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                近期错题趋势
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">过去30天错题数量与难度变化</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mistakeTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.1} />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="错题数量"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="avgDifficulty"
                  name="平均难度"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 知识点分布饼图 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                知识点分布
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">错题涉及的知识点占比</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={knowledgeDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {knowledgeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 难度分布柱状图 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                难度分布
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">错题难度级别统计（带升起动画）</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={difficultyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.1} />
                <XAxis dataKey="level" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="count"
                  name="题目数量"
                  radius={[4, 4, 0, 0]}
                  animationBegin={0}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* 数据分析总结 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-gradient-to-r from-tech-blue-50 to-tech-blue-100 dark:from-tech-blue-900/30 dark:to-tech-blue-800/30 rounded-xl p-6 border border-tech-blue-200 dark:border-tech-blue-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">📊 数据分析总结</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">优势领域</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>定积分掌握较好，错误率较低</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>简单题目正确率保持稳定</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">待改进领域</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>极限与导数应用错误率较高</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>中等难度题目需要加强练习</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default StatsPage