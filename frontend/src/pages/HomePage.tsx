import { motion } from 'framer-motion'
import { Brain, TrendingUp, Users, BookOpen, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const HomePage = () => {
  return (
    <div className="space-y-8">
      {/* 英雄区域 */}
      <section className="text-center py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-br from-tech-blue-100 to-tech-blue-200 dark:from-tech-blue-900/30 dark:to-tech-blue-800/30 mb-6">
            <Brain className="h-12 w-12 text-tech-blue-600 dark:text-tech-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4">
            智能分析你的数学错题
            <span className="block text-tech-blue-600 dark:text-tech-blue-400">让学习更高效</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            基于AI的数学错题分析系统，帮助大学生精准定位知识漏洞，提供个性化学习建议，提升数学学习效率。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/mistakes"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-tech-blue-600 to-tech-blue-700 text-white font-medium hover:from-tech-blue-700 hover:to-tech-blue-800 transition-all duration-200"
            >
              开始分析错题
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              to="/generate"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-tech-blue-600 text-tech-blue-600 dark:text-tech-blue-400 font-medium hover:bg-tech-blue-50 dark:hover:bg-tech-blue-900/30 transition-colors"
            >
              智能生成练习
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 功能导航卡片 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">核心功能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: '错题管理',
              description: '系统化整理数学错题，支持搜索、筛选和分类',
              icon: BookOpen,
              color: 'from-blue-500 to-cyan-500',
              href: '/mistakes',
            },
            {
              title: 'AI智能分析',
              description: '深度分析错误原因，定位知识漏洞，提供学习建议',
              icon: Brain,
              color: 'from-purple-500 to-pink-500',
              href: '#',
            },
            {
              title: '智能生成',
              description: '根据知识漏洞生成个性化练习题，巩固薄弱环节',
              icon: TrendingUp,
              color: 'from-green-500 to-emerald-500',
              href: '/generate',
            },
            {
              title: '学习统计',
              description: '可视化学习进度，追踪正确率趋势，优化学习计划',
              icon: Users,
              color: 'from-orange-500 to-red-500',
              href: '/stats',
            },
          ].map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  to={feature.href}
                  className="card block h-full p-6 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className={`mb-4 inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {feature.description}
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-midnight-700 flex items-center text-tech-blue-600 dark:text-tech-blue-400 text-sm font-medium">
                    立即体验
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* 近期统计概览 */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">近期学习概览</h2>
          <Link
            to="/stats"
            className="text-sm text-tech-blue-600 dark:text-tech-blue-400 hover:text-tech-blue-700 dark:hover:text-tech-blue-300 font-medium"
          >
            查看详细统计 →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">总错题数</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">24</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              <span className="text-green-600 dark:text-green-400">+3</span> 本周新增
            </p>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">平均正确率</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">78%</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              <span className="text-green-600 dark:text-green-400">+5%</span> 较上周提升
            </p>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">高频知识漏洞</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">3</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
                <Brain className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              主要集中在 <span className="font-medium">极限计算</span>
            </p>
          </div>
        </div>
      </section>

      {/* 技术特性 */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-midnight-900 dark:to-midnight-800 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">技术特性</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">AI智能分析引擎</h3>
            <ul className="space-y-3">
              {['基于Qwen2.5-7B大语言模型', '精准识别错误类型', '提供分步解析与通法总结', '生成个性化学习建议'].map((item) => (
                <li key={item} className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-tech-blue-500 mr-3"></div>
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">数据驱动学习</h3>
            <ul className="space-y-3">
              {['错题数据可视化分析', '学习进度追踪', '知识点掌握度评估', '智能推荐练习题目'].map((item) => (
                <li key={item} className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-tech-blue-500 mr-3"></div>
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage