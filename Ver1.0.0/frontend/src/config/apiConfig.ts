// API配置文件
const getApiBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  return envUrl || 'http://localhost:8001';
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  HEALTH: '/health',
  IMPORT_TEXT: '/api/import/text',
  IMPORT_FILE: '/api/import/file',
  MISTAKES: '/api/mistakes',
  MISTAKE_BY_ID: '/api/mistakes/:id',
  DELETE_MISTAKE: '/api/mistakes/:id',
  CLEAR_ALL_MISTAKES: '/api/mistakes',
  ANALYZE: '/api/analyze',
  GENERATE_QUESTIONS: '/api/generate/questions',
  GENERATE_PAPER: '/api/generate/paper',
  EXPORT_PAPER: '/api/export/paper',
  EXPORT_ANSWERS: '/api/export/answers',
  STATISTICS: '/api/statistics'
};

export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
};
