// 难度级别枚举
export enum DifficultyLevel {
  EASY = '简单',
  MEDIUM = '中等',
  HARD = '困难',
  EXPERT = '专家',
}

// 题目类型枚举
export enum QuestionType {
  CALCULATION = '计算题',
  PROOF = '证明题',
  APPLICATION = '应用题',
  CHOICE = '选择题',
  FILL_BLANK = '填空题',
  COMPREHENSIVE = '综合题',
}

// 创建错题的请求模型
export interface MistakeCreate {
  question_content: string
  wrong_process: string
  wrong_answer: string
  correct_answer: string
  question_type: QuestionType
  knowledge_tags: string[]
  difficulty: DifficultyLevel
  source?: string
  notes?: string
}

// 错题响应模型
export interface MistakeResponse {
  id: string
  question_content: string
  wrong_process: string
  wrong_answer: string
  correct_answer: string
  question_type: QuestionType
  knowledge_tags: string[]
  difficulty: DifficultyLevel
  source?: string
  notes?: string
  created_at: string  // ISO 8601 string from backend
  updated_at: string  // ISO 8601 string from backend
  analysis_result?: AnalysisResult
}

// 更新错题的请求模型
export interface MistakeUpdate {
  question_content?: string
  wrong_process?: string
  wrong_answer?: string
  correct_answer?: string
  question_type?: QuestionType
  knowledge_tags?: string[]
  difficulty?: DifficultyLevel
  source?: string
  notes?: string
}

// AI分析请求模型
export interface AnalysisRequest {
  mistake_id: string
  question_content: string
  wrong_process: string
  wrong_answer: string
  correct_answer: string
}

// AI分析响应模型
export interface AnalysisResponse {
  mistake_id: string
  error_type: string
  root_cause: string
  knowledge_gap: string[]
  learning_suggestions: string[]
  similar_examples: string[]
  confidence_score: number
}

// AI分析结果（存储在错题中）
export interface AnalysisResult {
  error_type: string
  root_cause: string
  knowledge_gap: string[]
  learning_suggestions: string[]
  similar_examples: string[]
  confidence_score: number
  analyzed_at: string
}

// 统计信息响应模型
export interface StatsResponse {
  total_mistakes: number
  mistakes_by_type: Record<string, number>
  mistakes_by_difficulty: Record<string, number>
  top_knowledge_gaps: string[]
  accuracy_trend: number[]
}

// AI生成练习题响应模型
export interface GeneratePracticeResponse {
  knowledge_gaps: string[]
  difficulty: string
  similarity_level: string
  count: number
  questions: string[]
}

// API响应包装器
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 分页参数
export interface PaginationParams {
  page?: number
  page_size?: number
  search?: string
  question_type?: QuestionType
  difficulty?: DifficultyLevel
  knowledge_tag?: string
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// 主题类型
export type Theme = 'light' | 'dark' | 'tech-blue'