import axios, { AxiosResponse } from 'axios'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const env = (import.meta as any).env ?? {}

// Determine base URL:
// 1. If running in browser (window defined), prefer relative path '/api' to use Vite proxy
// 2. Otherwise use environment variable or default to localhost:8002
const isBrowser = typeof window !== 'undefined'
const defaultBaseUrl = isBrowser ? '/api' : 'http://localhost:8002/api'

// Only use VITE_API_BASE_URL if we are NOT in browser, or if it's explicitly set to something other than localhost
// This prevents the .env.development file from forcing direct connection when we want proxy
let API_BASE_URL = defaultBaseUrl
if (env.VITE_API_BASE_URL && !isBrowser) {
  API_BASE_URL = env.VITE_API_BASE_URL
}

import {
  MistakeCreate,
  MistakeResponse,
  MistakeUpdate,
  AnalysisResponse,
  StatsResponse,
  PaginationParams,
  PaginatedResponse,
  ApiResponse,
  GeneratePracticeResponse,
} from '../types'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

// 响应拦截器（仅统一错误处理，保持原始响应结构）
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || '请求失败'
    return Promise.reject(new Error(message))
  }
)

const unwrap = async <T>(promise: Promise<AxiosResponse<T>>): Promise<T> => {
  const response = await promise
  return response.data
}

// 错题管理API
export const mistakesApi = {
  // 获取错题列表（分页+筛选）
  getMistakes: (params?: PaginationParams) =>
    unwrap(api.get<PaginatedResponse<MistakeResponse>>('/mistakes', { params })),

  // 获取单个错题
  getMistake: (id: string) => unwrap(api.get<MistakeResponse>(`/mistakes/${id}`)),

  // 创建错题
  createMistake: (data: MistakeCreate) => unwrap(api.post<MistakeResponse>('/mistakes', data)),

  // 更新错题
  updateMistake: (id: string, data: MistakeUpdate) => unwrap(api.put<MistakeResponse>(`/mistakes/${id}`, data)),

  // 删除错题
  deleteMistake: (id: string) => unwrap(api.delete<ApiResponse<void>>(`/mistakes/${id}`)),

  // AI分析错题
  analyzeMistake: (id: string) => unwrap(api.post<AnalysisResponse>(`/mistakes/${id}/analyze`)),

  // 获取统计摘要
  getStatsSummary: () => unwrap(api.get<StatsResponse>('/mistakes/stats/summary')),
  // 获取题目类型枚举（后端返回 { value, name } 数组，这里用 any[] 承接）
  getQuestionTypes: () => unwrap(api.get<any[]>('/mistakes/types/list')),
  // 获取难度级别枚举
  getDifficultyLevels: () => unwrap(api.get<any[]>('/mistakes/difficulty/list')),
}

// AI分析API
export const aiApi = {
  // 直接分析错题（无需保存）
  analyzeDirect: (data: {
    question_content: string
    wrong_process: string
    wrong_answer: string
    correct_answer: string
  }) => unwrap(api.post<AnalysisResponse>('/ai/analyze', data)),

  // 生成练习题
  generatePractice: (params: {
    knowledge_gaps: string[]
    difficulty: string
    count: number
    similarity_level?: string
  }) =>
    unwrap(
      api.post<GeneratePracticeResponse>('/ai/generate-practice', {
        similarity_level: params.similarity_level ?? 'medium',
        ...params,
      })
    ),

  // 解释数学概念
  explainConcept: (concept: string) => unwrap(api.get<string>(`/ai/explain/${encodeURIComponent(concept)}`)),
  // 健康检查
  checkHealth: () => unwrap(api.get<{ status: string; model: string }>('/ai/health')),
  // 获取模型信息
  getModelInfo: () => unwrap(api.get<{ model: string; version: string }>('/ai/model-info')),
}

// 系统API
export const systemApi = {
  // 健康检查
  checkHealth: () => unwrap(api.get<{ status: string; version: string }>('/health')),
  // 获取API版本
  getVersion: () => unwrap(api.get<{ version: string }>('/api/version')),
}

export default api