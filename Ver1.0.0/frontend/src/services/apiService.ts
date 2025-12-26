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
      headers: {}  // 不设置Content-Type，让浏览器自动设置multipart/form-data
    });
  },
  
  // 错题管理
  getAllMistakes: () => request<Mistake[]>(API_ENDPOINTS.MISTAKES),
  
  getMistakeById: (id: string) => request<Mistake>(API_ENDPOINTS.MISTAKE_BY_ID.replace(':id', id)),
  
  deleteMistake: (id: string) => request<{ success: boolean; message: string }>(
    API_ENDPOINTS.DELETE_MISTAKE.replace(':id', id), 
    'DELETE'
  ),
  
  clearAllMistakes: () => request<{ success: boolean; message: string }>(
    API_ENDPOINTS.CLEAR_ALL_MISTAKES, 
    'DELETE'
  ),
  
  // AI错题分析
  analyzeMistake: (mistakeId: string) => request<AnalysisResult>(API_ENDPOINTS.ANALYZE, 'POST', { mistakeId }),
  
  // 题目生成
  generateQuestions: (params: GenerationParams) => {
    const backendParams = {
      mistake_id: params.base_mistake_id,
      similarity_level: params.similarity === 'only_numbers' ? '仅改数字' : 
                        params.similarity === 'same_type' ? '同类型变形' : '混合知识点',
      quantity: params.quantity,
      target_difficulty: params.difficulty === 'easy' ? '简单' : 
                         params.difficulty === 'medium' ? '中等' : '困难'
    };
    return request<{ success: boolean; message: string; questions: any[] }>(
      API_ENDPOINTS.GENERATE_QUESTIONS, 
      'POST', 
      backendParams
    );
  },
  
  // 试卷生成与导出
  generatePaper: (params: PaperParams) => request<Paper>(API_ENDPOINTS.GENERATE_PAPER, 'POST', params),

  exportPaper: (_paperId: string) => request<Blob>(API_ENDPOINTS.EXPORT_PAPER, 'GET', undefined, {
    headers: { Accept: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
  }),

  exportAnswers: (_paperId: string) => request<Blob>(API_ENDPOINTS.EXPORT_ANSWERS, 'GET', undefined, {
    headers: { Accept: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
  }),
  
  // 统计数据
  getStatistics: () => request<Statistics>(API_ENDPOINTS.STATISTICS)
};
