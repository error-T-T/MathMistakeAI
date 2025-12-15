import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Edit, Save, X, Brain, AlertCircle, CheckCircle, BookOpen, Clock, BarChart } from 'lucide-react'
import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import { mistakesApi } from '../services/api'
import { MistakeResponse, AnalysisResult } from '../types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Alert } from '../components/ui/Alert'
import { Skeleton } from '../components/ui/Skeleton'
import { Input } from '../components/ui/Input'

const MistakeDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const isEditMode = queryParams.get('edit') === 'true'

  // 状态管理
  const [mistake, setMistake] = useState<MistakeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  // 编辑模式状态
  const [editData, setEditData] = useState<Partial<MistakeResponse>>({
    question_content: '',
    wrong_process: '',
    wrong_answer: '',
    correct_answer: '',
    knowledge_tags: [],
    notes: '',
  })

  // 获取错题详情
  const fetchMistake = async () => {
    if (!id) {
      setError('错题ID不存在')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await mistakesApi.getMistake(id)
      console.log('错题详情API响应:', data) // 调试信息
      
      // 确保数据格式正确
      if (!data) {
        throw new Error('未获取到错题数据')
      }
      
      setMistake(data)
      setEditData({
        question_content: data.question_content || '',
        wrong_process: data.wrong_process || '',
        wrong_answer: data.wrong_answer || '',
        correct_answer: data.correct_answer || '',
        knowledge_tags: Array.isArray(data.knowledge_tags) ? [...data.knowledge_tags] : [],
        notes: data.notes || '',
      })
    } catch (err: any) {
      const errorMessage = err.message || '获取错题详情失败'
      setError(errorMessage)
      console.error('获取错题详情失败:', err)
    } finally {
      setLoading(false)
    }
  }

  // 请求AI分析
  const handleAnalyze = async () => {
    if (!id || !mistake) return

    try {
      setAnalyzing(true)
      await mistakesApi.analyzeMistake(id)
      // 重新获取更新后的错题数据
      await fetchMistake()
    } catch (err: any) {
      setError(err.message || 'AI分析失败')
      console.error('AI分析失败:', err)
    } finally {
      setAnalyzing(false)
    }
  }

  // 保存编辑
  const handleSave = async () => {
    if (!id || !editData) return

    try {
      setSaving(true)
      await mistakesApi.updateMistake(id, editData)
      await fetchMistake() // 重新获取最新数据
      navigate(`/mistakes/${id}`) // 退出编辑模式
    } catch (err: any) {
      setError(err.message || '保存失败')
      console.error('保存失败:', err)
    } finally {
      setSaving(false)
    }
  }

  // 取消编辑
  const handleCancel = () => {
    navigate(`/mistakes/${id}`)
  }

  // 初始加载
  useEffect(() => {
    fetchMistake()
  }, [id])

  // 渲染LaTeX内容
  const renderWithLatex = (text: string) => {
    if (!text) return null
    
    // 简单的LaTeX检测：包含$...$或$$...$$
    if (text.includes('$')) {
      try {
        // 处理行内公式 $...$
        const parts = text.split(/(\$[^$]+\$)/g)
        return (
          <span>
            {parts.map((part, index) => {
              if (part.startsWith('$') && part.endsWith('$')) {
                const formula = part.slice(1, -1)
                return <InlineMath key={index} math={formula} />
              }
              return <span key={index}>{part}</span>
            })}
          </span>
        )
      } catch (err) {
        console.error('LaTeX渲染错误:', err)
        return text
      }
    }
    return text
  }

  // 渲染难度徽章颜色
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '简单': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case '中等': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case '困难': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case '专家': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  // 渲染分析结果部分
  const renderAnalysis = (analysis: AnalysisResult) => {
    // 确保analysis存在且有数据
    if (!analysis) return null
    
    return (
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="h-5 w-5 text-tech-blue-600 dark:text-tech-blue-400 mr-2" />
              <CardTitle>AI分析结果</CardTitle>
            </div>
            {analysis.confidence_score && (
              <Badge className="bg-tech-blue-100 text-tech-blue-800 dark:bg-tech-blue-900 dark:text-tech-blue-300">
                置信度: {Math.round(analysis.confidence_score * 100)}%
              </Badge>
            )}
          </div>
          {analysis.analyzed_at && (
            <CardDescription>
              分析时间: {new Date(analysis.analyzed_at).toLocaleString()}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 错误类型 */}
          {analysis.error_type && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1 text-red-500" />
                错误类型
              </h4>
              <p className="text-gray-900 dark:text-gray-100">{analysis.error_type}</p>
            </div>
          )}

          {/* 根本原因 */}
          {analysis.root_cause && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1 text-orange-500" />
                根本原因
              </h4>
              <p className="text-gray-900 dark:text-gray-100">{analysis.root_cause}</p>
            </div>
          )}

          {/* 知识漏洞 */}
          {analysis.knowledge_gap && analysis.knowledge_gap.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <BookOpen className="h-4 w-4 mr-1 text-blue-500" />
                知识漏洞
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.knowledge_gap.map((gap, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {gap}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 学习建议 */}
          {analysis.learning_suggestions && analysis.learning_suggestions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                学习建议
              </h4>
              <ul className="space-y-2">
                {analysis.learning_suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <div className="h-2 w-2 rounded-full bg-tech-blue-500 mt-2 mr-3"></div>
                    <span className="text-gray-900 dark:text-gray-100">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 相似例题 */}
          {analysis.similar_examples && analysis.similar_examples.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <BarChart className="h-4 w-4 mr-1 text-purple-500" />
                相似例题
              </h4>
              <ul className="space-y-2">
                {analysis.similar_examples.map((example, index) => (
                  <li key={index} className="flex items-start">
                    <div className="h-2 w-2 rounded-full bg-purple-500 mt-2 mr-3"></div>
                    <span className="text-gray-900 dark:text-gray-100">{renderWithLatex(example)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // 渲染编辑表单
  const renderEditForm = () => {
    if (!editData) return null

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>编辑错题</CardTitle>
          <CardDescription>修改错题信息后保存</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 题目内容 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              题目内容
            </label>
            <textarea
              value={editData.question_content || ''}
              onChange={(e) => setEditData({ ...editData, question_content: e.target.value })}
              className="input-primary min-h-[100px]"
              placeholder="请输入题目内容，支持LaTeX公式（使用$...$包围）"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              提示：使用 $公式$ 插入行内LaTeX公式，如 $x^2 + y^2 = 1$
            </p>
          </div>

          {/* 错误过程 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              错误过程
            </label>
            <textarea
              value={editData.wrong_process || ''}
              onChange={(e) => setEditData({ ...editData, wrong_process: e.target.value })}
              className="input-primary min-h-[80px]"
              placeholder="描述错误的解题过程"
            />
          </div>

          {/* 错误答案 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              错误答案
            </label>
            <Input
              type="text"
              value={editData.wrong_answer || ''}
              onChange={(e) => setEditData({ ...editData, wrong_answer: e.target.value })}
              placeholder="输入错误的答案"
            />
          </div>

          {/* 正确答案 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              正确答案
            </label>
            <Input
              type="text"
              value={editData.correct_answer || ''}
              onChange={(e) => setEditData({ ...editData, correct_answer: e.target.value })}
              placeholder="输入正确的答案"
            />
          </div>

          {/* 知识点标签 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              知识点标签（用逗号分隔）
            </label>
            <Input
              type="text"
              value={editData.knowledge_tags?.join(', ') || ''}
              onChange={(e) => setEditData({
                ...editData,
                knowledge_tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
              })}
              placeholder="例如：极限计算, 导数应用, 积分技巧"
            />
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              备注
            </label>
            <textarea
              value={editData.notes || ''}
              onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
              className="input-primary min-h-[60px]"
              placeholder="可选的备注信息"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            <X className="h-4 w-4 mr-2" />
            取消
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                保存更改
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // 渲染详情视图
  const renderDetailView = () => {
    if (!mistake) return null

    return (
      <>
        {/* 错题基本信息卡片 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {renderWithLatex(mistake.question_content || '无题目内容')}
                </CardTitle>
                <div className="flex items-center gap-4 mt-2">
                  {mistake.question_type && (
                    <Badge>{mistake.question_type}</Badge>
                  )}
                  {mistake.difficulty && (
                    <Badge className={getDifficultyColor(mistake.difficulty)}>
                      {mistake.difficulty}
                    </Badge>
                  )}
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4 mr-1" />
                    {mistake.created_at ? `创建于 ${new Date(mistake.created_at).toLocaleDateString()}` : '未知创建时间'}
                  </div>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate(`/mistakes/${id}?edit=true`)}>
                <Edit className="h-4 w-4 mr-2" />
                编辑
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 知识点标签 */}
            {mistake.knowledge_tags && mistake.knowledge_tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">知识点标签</h4>
                <div className="flex flex-wrap gap-2">
                  {mistake.knowledge_tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 答案对比 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1 text-red-500" />
                  错误答案
                </h4>
                <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                  <CardContent className="py-3">
                    <p className="text-red-700 dark:text-red-300">{renderWithLatex(mistake.wrong_answer || '无错误答案')}</p>
                  </CardContent>
                </Card>
                {mistake.wrong_process && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">错误过程:</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{renderWithLatex(mistake.wrong_process)}</p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                  正确答案
                </h4>
                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <CardContent className="py-3">
                    <p className="text-green-700 dark:text-green-300 font-medium">
                      {renderWithLatex(mistake.correct_answer || '无正确答案')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* 备注 */}
            {mistake.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">备注</h4>
                <p className="text-gray-900 dark:text-gray-100">{mistake.notes}</p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between border-t pt-4">
            <Button variant="outline" onClick={() => navigate('/mistakes')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回列表
            </Button>
            <Button onClick={handleAnalyze} disabled={analyzing || !id}>
              {analyzing ? (
                <>
                  <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  分析中...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  {mistake.analysis_result ? '重新分析' : 'AI智能分析'}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* AI分析结果 */}
        {mistake.analysis_result && renderAnalysis(mistake.analysis_result)}
      </>
    )
  }

  // 渲染加载状态
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/mistakes')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // 渲染错误状态
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/mistakes')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
        </div>
        <Alert variant="destructive" icon={<AlertCircle className="h-4 w-4" />}>
          {error}
        </Alert>
      </div>
    )
  }

  // 渲染未找到错题
  if (!mistake) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/mistakes')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
        </div>
        <Card className="text-center py-12">
          <CardContent>
            <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">未找到错题</h3>
            <p className="text-gray-600 dark:text-gray-400">
              请求的错题不存在或已被删除
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 导航栏 */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/mistakes')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回列表
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {isEditMode ? '编辑错题' : '错题详情'}
        </h1>
      </div>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive" icon={<AlertCircle className="h-4 w-4" />}>
          {error}
        </Alert>
      )}

      {/* 主内容 */}
      {isEditMode ? renderEditForm() : renderDetailView()}
    </div>
  )
}

export default MistakeDetailPage