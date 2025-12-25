import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { motion } from 'framer-motion'

// 导入页面组件
import HomePage from './pages/HomePage'
import MistakeManagementPage from './pages/MistakeManagementPage'
import MistakeDetailPage from './pages/MistakeDetailPage'
import GenerationPage from './pages/GenerationPage'
import StatisticsPage from './pages/StatisticsPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
        {/* 导航栏 */}
        <nav className="bg-black/30 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                >
                  MathMistakeAI
                </motion.div>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                {[
                  { name: '首页', path: '/' },
                  { name: '错题管理', path: '/mistakes' },
                  { name: '智能生成', path: '/generate' },
                  { name: '数据统计', path: '/statistics' }
                ].map((item) => (
                  <motion.nav
                    key={item.path}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to={item.path}
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </motion.nav>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* 主内容区 */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/mistakes" element={<MistakeManagementPage />} />
            <Route path="/mistakes/:id" element={<MistakeDetailPage />} />
            <Route path="/generate" element={<GenerationPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
          </Routes>
        </main>

        {/* 页脚 */}
        <footer className="bg-black/30 backdrop-blur-lg border-t border-white/10 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white/60 text-sm">
            <p>© 2025 MathMistakeAI. 大学生数学错题智能分析系统</p>
            <p className="mt-1">基于本地AI的个性化错题处理系统</p>
            <p className="mt-2 text-xs text-white/40">
              作者：Rookie & 艾可希雅 | 
              <a 
                href="https://github.com/error-T-T/MathMistakeAI" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition-colors ml-1"
              >
                GitHub: error-T-T/MathMistakeAI
              </a> |
              <span className="ml-1">邮箱：RookieT@e.gzhu.edu.cn</span>
            </p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
