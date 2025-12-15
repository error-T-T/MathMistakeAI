import { Outlet, Link, useLocation } from 'react-router-dom'
import { Brain, Home, List, BarChart3, Sparkles, Moon, Sun, Zap } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { cn } from '../../lib/utils'

const Layout = () => {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const navigation = [
    { name: '首页', href: '/', icon: Home },
    { name: '错题管理', href: '/mistakes', icon: List },
    { name: '智能生成', href: '/generate', icon: Sparkles },
    { name: '数据统计', href: '/stats', icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-midnight-950">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-midnight-800 bg-white/80 dark:bg-midnight-900/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-tech-blue-500 to-tech-blue-700">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-tech-blue-600 to-tech-blue-800 bg-clip-text text-transparent">
                  MathMistakeAI
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">数学错题智能分析系统</p>
              </div>
            </Link>

            {/* 桌面导航 */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-tech-blue-50 dark:bg-tech-blue-900/30 text-tech-blue-700 dark:text-tech-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-midnight-800'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            {/* 右侧操作区 */}
            <div className="flex items-center space-x-3">
              {/* 主题切换按钮 */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg border border-gray-200 dark:border-midnight-700 bg-white dark:bg-midnight-800 hover:bg-gray-50 dark:hover:bg-midnight-700 transition-colors"
                aria-label="切换主题"
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                ) : theme === 'dark' ? (
                  <Zap className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Sun className="h-5 w-5 text-tech-blue-500" />
                )}
              </button>

              {/* 用户头像占位 */}
              <div className="hidden md:block">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-tech-blue-400 to-tech-blue-600 flex items-center justify-center text-white text-sm font-medium">
                  R
                </div>
              </div>
            </div>
          </div>

          {/* 移动端导航 */}
          <nav className="md:hidden flex items-center justify-around mt-3 pb-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex flex-col items-center px-3 py-2 rounded-lg text-xs transition-colors',
                    isActive
                      ? 'text-tech-blue-700 dark:text-tech-blue-300'
                      : 'text-gray-600 dark:text-gray-400'
                  )}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        <Outlet />
      </main>

      {/* 页脚 */}
      <footer className="border-t border-gray-200 dark:border-midnight-800 bg-white dark:bg-midnight-900 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-tech-blue-600 dark:text-tech-blue-400" />
                <span className="font-semibold text-gray-900 dark:text-gray-100">MathMistakeAI</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                大学生数学错题智能分析系统
              </p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>开发者: Rookie (error-T-T) & 艾可希雅</p>
              <p className="mt-1">© {new Date().getFullYear()} MathMistakeAI. 保留所有权利。</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout