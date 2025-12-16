import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, Plus, Loader2, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { mistakesApi } from '../services/api'
import { DifficultyLevel, QuestionType, MistakeResponse } from '../types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'
import { Dialog } from '../components/ui/Dialog'
import { Skeleton } from '../components/ui/Skeleton'
import MistakeCard from '../components/MistakeCard'

const MistakesPage = () => {
  // 状态管理
  const [mistakes, setMistakes] = useState<MistakeResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 搜索和筛选状态
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<QuestionType | 'all'>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all')
  const [selectedTag, setSelectedTag] = useState<string>('')

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const pageSize = 12

  // 删除确认对话框
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [mistakeToDelete, setMistakeToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // 标签列表（从错题中提取）
  const [availableTags, setAvailableTags] = useState<string[]>([])

  // 搜索处理函数
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMistakes();
  };

  // 获取错题列表
  const fetchMistakes = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        page_size: pageSize,
        search: searchQuery || undefined,
        question_type: selectedType !== 'all' ? selectedType : undefined,
        difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
        knowledge_tag: selectedTag || undefined,
      };

      const response = await mistakesApi.getMistakes(params);

      if (response && response.items && Array.isArray(response.items)) {
        setMistakes(response.items);
        setTotalItems(response.total || 0);
        setTotalPages(response.total_pages || 1);

        // 提取标签
        const tags = new Set<string>();
        response.items.forEach(mistake => {
          mistake.knowledge_tags.forEach(tag => tags.add(tag));
        });
        setAvailableTags(Array.from(tags));
      } else {
        console.error('Unexpected response format:', response);
        setMistakes([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('获取错题列表失败:', error);
      setError('获取错题列表失败，请稍后重试');
      setMistakes([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // 删除错题
  const handleDelete = async () => {
    if (!mistakeToDelete) return;

    try {
      setDeleting(true);
      await mistakesApi.deleteMistake(mistakeToDelete);
      setDeleteDialogOpen(false);
      setMistakeToDelete(null);
      fetchMistakes(); // 刷新列表
    } catch (error) {
      console.error('删除错题失败:', error);
      setError('删除错题失败，请稍后重试');
    } finally {
      setDeleting(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchMistakes();
  }, [currentPage]);

  // 打开删除确认对话框
  const openDeleteDialog = (id: string) => {
    setMistakeToDelete(id)
    setDeleteDialogOpen(true)
  }

  // 重置筛选条件
  const resetFilters = () => {
    setSearchQuery('')
    setSelectedType('all')
    setSelectedDifficulty('all')
    setSelectedTag('')
    setCurrentPage(1)
  }

  // 渲染加载骨架屏
  const renderSkeletons = () => (
    Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="space-y-3">
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    ))
  )

  return (
    <div className="space-y-6">
      {/* 页面标题和操作按钮 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">错题管理</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理你的数学错题，进行智能分析和学习规划
          </p>
        </div>
        <Link to="/mistakes/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            新增错题
          </Button>
        </Link>
      </div>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive" icon={<AlertCircle className="h-4 w-4" />}>
          {error}
        </Alert>
      )}

      {/* 搜索和筛选区域 */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="搜索题目内容或知识点..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 筛选器 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 题目类型筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  题目类型
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as QuestionType | 'all')}
                  className="input-primary w-full"
                >
                  <option value="all">全部类型</option>
                  {Object.values(QuestionType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* 难度筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  难度级别
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyLevel | 'all')}
                  className="input-primary w-full"
                >
                  <option value="all">全部难度</option>
                  {Object.values(DifficultyLevel).map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* 知识点标签筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  知识点标签
                </label>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="input-primary w-full"
                >
                  <option value="">全部标签</option>
                  {availableTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="gap-2">
                <Search className="h-4 w-4" />
                搜索
              </Button>
              <Button type="button" variant="outline" onClick={resetFilters} className="gap-2">
                <Filter className="h-4 w-4" />
                重置筛选
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 结果统计 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          共找到 <span className="font-semibold text-gray-900 dark:text-gray-100">{totalItems}</span> 道错题
        </div>
        {totalPages > 1 && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            第 <span className="font-semibold">{currentPage}</span> / {totalPages} 页
          </div>
        )}
      </div>

      {/* 错题网格 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderSkeletons()}
        </div>
      ) : mistakes.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Search className="h-12 w-12 mx-auto opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">暂无错题数据</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || selectedType !== 'all' || selectedDifficulty !== 'all' || selectedTag
                ? '没有找到符合条件的错题，请尝试调整筛选条件'
                : '还没有添加任何错题，点击"新增错题"开始添加吧！'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mistakes.map(mistake => (
              <MistakeCard
                key={mistake.id}
                mistake={mistake}
                onDelete={openDeleteDialog}
              />
            ))}
          </div>

          {/* 分页控件 */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                上一页
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      )}

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Card>
          <CardHeader>
            <CardTitle>确认删除</CardTitle>
            <CardDescription>
              确定要删除这道错题吗？此操作不可撤销。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              删除后，该错题及其AI分析结果将永久丢失。
            </p>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  删除中...
                </>
              ) : (
                '确认删除'
              )}
            </Button>
          </CardFooter>
        </Card>
      </Dialog>
    </div>
  )
}

export default MistakesPage