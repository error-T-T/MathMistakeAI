import axios from 'axios'
import {
  MistakeCreate,
  MistakeResponse,
  MistakeUpdate,
  AnalysisResponse,
  StatsResponse,
  PaginationParams,
  PaginatedResponse,
  ApiResponse,
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token等
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.detail || error.message || '请求失败'
    return Promise.reject(new Error(message))
  }
)

// 错题管理API
export const mistakesApi = {
  // 获取错题列表（分页+筛选）
  getMistakes: (params?: PaginationParams) =>
    api.get<PaginatedResponse<MistakeResponse>>('/mistakes', { params }),

  // 获取单个错题
  getMistake: (id: string) =>
    api.get<MistakeResponse>(`/mistakes/${id}`),

  // 创建错题
  createMistake: (data: MistakeCreate) =>
    api.post<MistakeResponse>('/mistakes', data),

  // 更新错题
  updateMistake: (id: string, data: MistakeUpdate) =>
    api.put<MistakeResponse>(`/mistakes/${id}`, data),

  // 删除错题
  deleteMistake: (id: string) =>
    api.delete<ApiResponse<void>>(`/mistakes/${id}`),

  // AI分析错题
  analyzeMistake: (id: string) =>
    api.post<AnalysisResponse>(`/mistakes/${id}/analyze`),

  // 获取统计摘要
  getStatsSummary: () =>
    api.get<StatsResponse>('/mistakes/stats/summary'),

  // 获取题目类型枚举
  getQuestionTypes: () =>
    api.get<string[]>('/mistakes/types/list'),

  // 获取难度级别枚举
  getDifficultyLevels: () =>
    api.get<string[]>('/mistakes/difficulty/list'),
}

// AI分析API
export const aiApi = {
  // 直接分析错题（无需保存）
  analyzeDirect: (data: {
    question_content: string
    wrong_process: string
    wrong_answer: string
    correct_answer: string
  }) => api.post<AnalysisResponse>('/ai/analyze', data),

  // 生成练习题
  generatePractice: (params: {
    knowledge_gaps: string[]
    difficulty: string
    count: number
  }) => api.post<string[]>('/ai/generate-practice', params),

  // 解释数学概念
  explainConcept: (concept: string) =>
    api.get<string>(`/ai/explain/${encodeURIComponent(concept)}`),

  // 健康检查
  checkHealth: () => api.get<{ status: string; model: string }>('/ai/health'),

  // 获取模型信息
  getModelInfo: () => api.get<{ model: string; version: string }>('/ai/model-info'),
}

// 系统API
export const systemApi = {
  // 健康检查
  checkHealth: () => api.get<{ status: string; version: string }>('/health'),

  // 获取API版本
  getVersion: () => api.get<{ version: string }>('/api/version'),
}

export default api