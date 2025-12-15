import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-9xl font-bold text-gray-300 dark:text-midnight-700">404</h1>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-4">页面未找到</h2>
      <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-md">
        您访问的页面不存在或已被移动。
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center justify-center px-6 py-3 rounded-lg bg-tech-blue-600 text-white font-medium hover:bg-tech-blue-700 transition-colors"
      >
        <Home className="mr-2 h-5 w-5" />
        返回首页
      </Link>
    </div>
  )
}

export default NotFoundPage