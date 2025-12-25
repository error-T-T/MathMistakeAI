import { API_BASE_URL, API_ENDPOINTS, API_CONFIG } from '../config/apiConfig';
import { Mistake, ImportResponse, AnalysisResult, GenerationParams, GeneratedQuestion, PaperParams, Paper, Statistics } from '../types';

// 基础请求函数
async function request<T>(
  endpoint: string,
  method: string = 'GET',
  data?: any,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { ...API_CONFIG.headers, ...options.headers };
  
  const config: RequestInit = {
    method,
    headers,
    ...options
  };

  if (data) {
    if (headers['Content-Type'] === 'multipart/form-data') {
      config.body = data;
    } else {
      config.body = JSON.stringify(data);
    }
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || '请求失败');
  }

  return response.json();
}

// API服务对象
export const apiService = {
  // 健康检查
  healthCheck: () => request<void>(API_ENDPOINTS.HEALTH),
  
  // 错题导入
  importText: (text: string) => request<ImportResponse>(API_ENDPOINTS.IMPORT_TEXT, 'POST', { text }),
  
  importFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<ImportResponse>(API_ENDPOINTS.IMPORT_FILE, 'POST', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // 错题管理
  getAllMistakes: () => request<Mistake[]>(API_ENDPOINTS.MISTAKES),
  
  getMistakeById: (id: string) => request<Mistake>(API_ENDPOINTS.MISTAKE_BY_ID.replace(':id', id)),
  
  // AI错题分析
  analyzeMistake: (mistakeId: string) => request<AnalysisResult>(API_ENDPOINTS.ANALYZE, 'POST', { mistakeId }),
  
  // 题目生成
  generateQuestions: (params: GenerationParams) => request<GeneratedQuestion[]>(API_ENDPOINTS.GENERATE_QUESTIONS, 'POST', params),
  
  // 试卷生成与导出
  generatePaper: (params: PaperParams) => request<Paper>(API_ENDPOINTS.GENERATE_PAPER, 'POST', params),
  
  exportPaper: (paperId: string) => request<Blob>(API_ENDPOINTS.EXPORT_PAPER, 'GET', undefined, {
    responseType: 'blob'
  }),
  
  exportAnswers: (paperId: string) => request<Blob>(API_ENDPOINTS.EXPORT_ANSWERS, 'GET', undefined, {
    responseType: 'blob'
  }),
  
  // 统计数据
  getStatistics: () => request<Statistics>(API_ENDPOINTS.STATISTICS)
};
