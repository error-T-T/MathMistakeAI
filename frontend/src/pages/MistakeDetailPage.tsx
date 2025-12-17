import { useState, useEffect, useMemo, ChangeEvent } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Edit, Save, X, Brain, AlertCircle, CheckCircle, BookOpen, Clock, BarChart, Loader2, Upload } from 'lucide-react'
import { InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import { mistakesApi } from '../services/api'
import { MistakeResponse, AnalysisResult, QuestionType, DifficultyLevel, MistakeCreate } from '../types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Alert } from '../components/ui/Alert'
import { Skeleton } from '../components/ui/Skeleton'
import { Input } from '../components/ui/Input'
import NoMistakeFallback from '../components/NoMistakeFallback'

const questionTypeMap: Record<string, QuestionType> = {
  计算题: QuestionType.CALCULATION,
  证明题: QuestionType.PROOF,
  应用题: QuestionType.APPLICATION,
  选择题: QuestionType.CHOICE,
  填空题: QuestionType.FILL_BLANK,
  综合题: QuestionType.COMPREHENSIVE,
}

const difficultyMap: Record<string, DifficultyLevel> = {
  简单: DifficultyLevel.EASY,
  中等: DifficultyLevel.MEDIUM,
  困难: DifficultyLevel.HARD,
  专家: DifficultyLevel.EXPERT,
}

const parseFieldLookup = (block: string) => {
  const lines = block.split(/\r?\n/)
  const fields: Record<string, string> = {}
  lines.forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed) return
    const match = trimmed.match(/^\[(.+?)\]\s*(.*)$/)
    if (match) {
      fields[match[1].trim()] = match[2].trim()
    }
  })
  return fields
}

const parseMistakeBlock = (block: string): MistakeCreate | null => {
  const fields = parseFieldLookup(block)
  const question_content = fields['题目内容'] || ''
  const correct_answer = fields['正确答案'] || ''
  if (!question_content || !correct_answer) {
    return null
  }

  const knowledgeTags = (fields['知识点标签'] || '')
    .split(/[，,;；]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)

  return {
    question_content,
    wrong_process: fields['错误过程'] || '',
    wrong_answer: fields['错误答案'] || '',
    correct_answer,
    question_type: questionTypeMap[fields['题目类型'] || ''] || QuestionType.CALCULATION,
    knowledge_tags: knowledgeTags,
    difficulty: difficultyMap[fields['难度等级'] || ''] || DifficultyLevel.MEDIUM,
    source: fields['题目ID'] || undefined,
    notes: fields['备注'] || undefined,
  }
}

const parseMistakesFromText = (text: string): MistakeCreate[] => {
  const trimmedContent = text.trim()
  if (!trimmedContent) return []

  const sections = trimmedContent.split(/\r?\n(?=\[题目ID\])|\n\n+/)
  return sections
    .map((segment) => parseMistakeBlock(segment.trim()))
    .filter((item): item is MistakeCreate => Boolean(item))
}

const MistakeDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const isEditQuery = queryParams.get('edit') === 'true'
  const isNew = !id
  const isEditMode = isNew || isEditQuery

  // 状态管理
  const [mistake, setMistake] = useState<MistakeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  const [importText, setImportText] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<string | null>(null)
  const [importFileName, setImportFileName] = useState('')

  const previewMistakes = useMemo(() => parseMistakesFromText(importText), [importText])

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
      // 新建模式下不需要从后端加载
      setLoading(false)
      setMistake(null)
      setEditData({
        question_content: '',
        wrong_process: '',
        wrong_answer: '',
        correct_answer: '',
        knowledge_tags: [],
        notes: '',
      })
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await mistakesApi.getMistake(id)
      console.log('错题详情API响应:', data)

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

  // 保存编辑（既支持更新也支持新建）
  const handleSave = async () => {
    if (!editData) return

    try {
      setSaving(true)
      if (isNew) {
        const payload: MistakeCreate = {
          question_content: editData.question_content || '',
          wrong_process: editData.wrong_process || '',
          wrong_answer: editData.wrong_answer || '',
          correct_answer: editData.correct_answer || '',
          question_type: (mistake?.question_type as QuestionType) || QuestionType.CALCULATION,
          knowledge_tags: editData.knowledge_tags || [],
          difficulty: (mistake?.difficulty as DifficultyLevel) || DifficultyLevel.MEDIUM,
          source: editData.source,
          notes: editData.notes,
        }
        const created = await mistakesApi.createMistake(payload)
        navigate(`/mistakes/${created.id}`)
      } else if (id) {
        await mistakesApi.updateMistake(id, editData)
        await fetchMistake()
        navigate(`/mistakes/${id}`)
      }
    } catch (err: any) {
      setError(err.message || '保存失败')
      console.error('保存失败:', err)
    } finally {
      setSaving(false)
    }
  }

  // 取消编辑
  const handleCancel = () => {
    if (isNew) {
      navigate('/mistakes')
    } else {
      navigate(`/mistakes/${id}`)
    }
  }

  // 文件处理
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImportFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      setImportText((reader.result as string) || '')
      setImportResult(null)
    }
    reader.onerror = () => {
      setImportError('文件读取失败，请确认文件编码为 UTF-8。')
    }
    reader.readAsText(file, 'utf-8')
    event.target.value = ''
  }

  const handleImportMistakes = async () => {
    const entries = parseMistakesFromText(importText)
    if (!entries.length) {
      setImportError('请提供符合模板的文本或正确上传文件。')
      setImportResult(null)
      return
    }

    try {
      setImporting(true)
      setImportError(null)
      const importedIds: string[] = []
      for (const entry of entries) {
        const created = await mistakesApi.createMistake(entry)
        importedIds.push(created.id)
      }
      setImportResult(`已成功导入 ${importedIds.length} 道错题`)
      setImportText('')
      setImportFileName('')
    } catch (err: any) {
      setImportError(err.message || '导入失败，请稍后重试。')
    } finally {
      setImporting(false)
    }
  }

  const renderImportSection = () => {
    const previewCount = previewMistakes.length
    const previewList = previewMistakes.slice(0, 3)

    return (
      <Card className="space-y-4">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-tech-blue-600 dark:text-tech-blue-400" />
            <CardTitle>导入错题模板</CardTitle>
          </div>
          <CardDescription>
            参考标准模板，将问题文本一次性导入，支持 LaTeX 表达式。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              粘贴文本内容
            </label>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="input-primary min-h-[120px] font-mono"
              placeholder={`示例：\n[题目ID] Q001\n[题目类型] 计算题\n[题目内容] 计算\\int_0^1 x^2 dx\n[错误过程] ...\n[错误答案] 1/3\n[正确答案] 1/3\n[知识点标签] 定积分, 微积分\n[难度等级] 中等`}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              或上传 .txt 文件
            </label>
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="w-full rounded-lg border border-dashed border-gray-300 bg-white px-3 py-2 text-sm text-gray-500 dark:border-midnight-700 dark:bg-midnight-900"
            />
            {importFileName && (
              <p className="text-xs text-gray-500">已加载：{importFileName}</p>
            )}
          </div>
          {previewCount > 0 ? (
            <div className="text-sm text-gray-500">
              <p>系统识别到 {previewCount} 条错题：</p>
              <ul className="mt-2 space-y-1 list-disc px-5 text-left">
                {previewList.map((entry, index) => (
                  <li key={index} className="truncate">
                    {entry.question_content}
                  </li>
                ))}
                {previewCount > 3 && (
                  <li className="text-xs text-gray-400">...共 {previewCount} 条（仅列出 3 条）</li>
                )}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              请确保每条记录包含题目内容、错/正确答案、题目类型、难度、知识点标签等字段。
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3 items-start md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-gray-500">
            支持字段：题目ID, 题目类型, 题目内容, 错误过程, 错误答案, 正确答案, 知识点标签, 难度等级, 备注
          </p>
          <Button onClick={handleImportMistakes} disabled={importing} className="gap-2">
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                导入中...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                解析并导入
              </>
            )}
          </Button>
        </CardFooter>
        {importError && (
          <Alert variant="destructive" icon={<AlertCircle className="h-4 w-4" />}>
            {importError}
          </Alert>
        )}
        {importResult && (
          <Alert variant="success" icon={<CheckCircle className="h-4 w-4" />}>
            {importResult}
          </Alert>
        )}
      </Card>
    )
  }

  // 渲染编辑表单
  const renderEditForm = () => {
    if (!editData) return null

    return (
      <div className="space-y-6">
        {isNew && renderImportSection()}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{isNew ? '新增错题' : '编辑错题'}</CardTitle>
            <CardDescription>
              {isNew
                ? '填写一条新的错题记录，便于后续分析和复习'
                : '修改错题信息后保存'}
            </CardDescription>
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
      </div>
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
  if (!mistake && !isNew) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/mistakes')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
        </div>
        <NoMistakeFallback description="请求的错题不存在或已被删除" />
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
          {isNew ? '新增错题' : isEditMode ? '编辑错题' : '错题详情'}
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