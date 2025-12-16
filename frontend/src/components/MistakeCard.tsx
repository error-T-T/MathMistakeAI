import React from 'react'
import { motion } from 'framer-motion'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MistakeResponse, DifficultyLevel } from '../types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'

interface MistakeCardProps {
  mistake: MistakeResponse
  onDelete: (id: string) => void
}

const getDifficultyColor = (difficulty: DifficultyLevel) => {
  switch (difficulty) {
    case DifficultyLevel.EASY: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case DifficultyLevel.MEDIUM: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    case DifficultyLevel.HARD: return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    case DifficultyLevel.EXPERT: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

const MistakeCard: React.FC<MistakeCardProps> = ({ mistake, onDelete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="h-full hover:shadow-lg transition-shadow duration-300 flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1 mr-2">
              <CardTitle className="text-lg line-clamp-1" title={mistake.question_content}>
                {mistake.question_content}
              </CardTitle>
              <CardDescription className="mt-1">
                {mistake.question_type}
              </CardDescription>
            </div>
            <Badge className={getDifficultyColor(mistake.difficulty)}>
              {mistake.difficulty}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-grow">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">知识点标签</p>
              <div className="flex flex-wrap gap-1">
                {mistake.knowledge_tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">错误答案</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2" title={mistake.wrong_answer}>
                {mistake.wrong_answer}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">正确答案</p>
              <p className="text-sm text-gray-900 dark:text-gray-100 font-medium" title={mistake.correct_answer}>
                {mistake.correct_answer}
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-4 mt-auto">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            创建于 {new Date(mistake.created_at).toLocaleDateString()}
          </div>
          <div className="flex gap-2">
            <Link to={`/mistakes/${mistake.id}`}>
              <Button size="sm" variant="outline">
                <Eye className="h-3 w-3 mr-1" />
                详情
              </Button>
            </Link>
            <Link to={`/mistakes/${mistake.id}?edit=true`}>
              <Button size="sm" variant="outline">
                <Edit className="h-3 w-3 mr-1" />
                编辑
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={() => onDelete(mistake.id)}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              删除
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default MistakeCard
