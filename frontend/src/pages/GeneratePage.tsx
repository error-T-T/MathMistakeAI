import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Download, Settings, Play, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Alert } from '../components/ui/Alert'
import { aiApi } from '../services/api'
import MathText from '../components/MathText'

const GeneratePage = () => {
  // 状态管理
  const [knowledgeGaps, setKnowledgeGaps] = useState<string>('导数, 积分, 极限')
  const [difficulty, setDifficulty] = useState<string>('中等')
  const [count, setCount] = useState<number>(5)
  const [loading, setLoading] = useState<boolean>(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<boolean>(true)

  // 难度选项
  const difficultyOptions = ['简单', '中等', '困难', '专家']

  // 知识点标签解析
  const parseKnowledgeGaps = (): string[] => {
    return knowledgeGaps
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
  }

  // 生成练习题
  const handleGenerate = async () => {
    const tags = parseKnowledgeGaps()
    if (tags.length === 0) {
      setError('请输入至少一个知识点标签')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await aiApi.generatePractice({
        knowledge_gaps: tags,
        difficulty,
        count,
      })
      // 使用后端返回的 questions 字段
      setGeneratedQuestions(result.questions)
      setPreviewMode(false)
    } catch (err: any) {
      console.error('生成练习题失败:', err)
      setError(err.message || '生成练习题失败，请检查网络连接或稍后重试')

      // 模拟数据（API不可用时使用）
      const mockQuestions = [
        `计算 $\\lim_{x\\to 0} \\frac{\\sin x}{x}$ 的值`,
        `求函数 $f(x) = x^3 - 3x^2 + 2$ 的极值点`,
        `计算定积分 $\\int_0^1 x^2 dx$`,
        `求矩阵 $A = \\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}$ 的行列式`,
        `解微分方程 $\\frac{dy}{dx} = 2x$`
      ]
      setGeneratedQuestions(mockQuestions.slice(0, count))
      setPreviewMode(false)
    } finally {
      setLoading(false)
    }
  }

  // 导出题目
  const handleExport = () => {
    const content = generatedQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `数学练习题_${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 预览示例题目
  const previewQuestions = [
    `计算 $\\lim_{x\\to 0} \\frac{\\sin x}{x}$ 的值`,
    `求函数 $f(x) = x^3 - 3x^2 + 2$ 的极值点`,
    `计算定积分 $\\int_0^1 x^2 dx$`,
    `求矩阵 $A = \\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}$ 的行列式`
  ]

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          智能题目生成
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          根据知识点漏洞和难度级别，智能生成针对性练习题
        </p>
      </div>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive" icon={<AlertCircle className="h-4 w-4" />}>
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：参数配置 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Settings className="h-5 w-5 text-tech-blue-600 dark:text-tech-blue-400 mr-2" />
                <CardTitle>生成参数</CardTitle>
              </div>
              <CardDescription>配置题目生成参数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 知识点标签 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  知识点标签（逗号分隔）
                </label>
                <Input
                  type="text"
                  value={knowledgeGaps}
                  onChange={(e) => setKnowledgeGaps(e.target.value)}
                  placeholder="例如：导数, 积分, 极限, 矩阵"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  输入需要练习的知识点，用逗号分隔
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {parseKnowledgeGaps().map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 难度选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  题目难度
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {difficultyOptions.map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={difficulty === option ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDifficulty(option)}
                      className="justify-center"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 题目数量 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  题目数量：{count} 道
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>1</span>
                  <span>10</span>
                  <span>20</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    智能生成
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* 右侧：结果展示 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 预览区域 */}
          {previewMode ? (
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Play className="h-5 w-5 text-tech-blue-600 dark:text-tech-blue-400 mr-2" />
                  <CardTitle>实时预览</CardTitle>
                </div>
                <CardDescription>根据当前参数预览题目样式</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {previewQuestions.map((question, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900/50"
                    >
                      <div className="flex items-start">
                        <div className="h-6 w-6 rounded-full bg-tech-blue-100 dark:bg-tech-blue-900/30 text-tech-blue-600 dark:text-tech-blue-400 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <MathText text={question} />
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {parseKnowledgeGaps()[0] || '数学'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  点击"智能生成"按钮开始生成个性化练习题
                </p>
              </CardFooter>
            </Card>
          ) : (
            /* 生成结果区域 */
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                    <CardTitle>生成结果</CardTitle>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    共 {generatedQuestions.length} 道题
                  </Badge>
                </div>
                <CardDescription>
                  根据您的配置生成的个性化练习题
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {generatedQuestions.map((question, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-tech-blue-300 dark:hover:border-tech-blue-700 transition-colors"
                    >
                      <div className="flex items-start">
                        <div className="h-6 w-6 rounded-full bg-tech-blue-100 dark:bg-tech-blue-900/30 text-tech-blue-600 dark:text-tech-blue-400 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <MathText text={question} />
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {parseKnowledgeGaps()[index % parseKnowledgeGaps().length] || '数学'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button
                  variant="outline"
                  onClick={() => setPreviewMode(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  重新配置
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={generatedQuestions.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  导出题目
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* 使用提示 */}
          <Alert icon={<Brain className="h-4 w-4" />}>
            <div className="text-sm">
              <p className="font-medium mb-1">💡 使用建议</p>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• 针对薄弱知识点进行精准练习</li>
                <li>• 先从简单难度开始，逐步提高</li>
                <li>• 生成的题目可以导出为文本文件</li>
                <li>• 建议每天练习 5-10 道题巩固效果</li>
              </ul>
            </div>
          </Alert>
        </div>
      </div>
    </div>
  )
}

export default GeneratePage