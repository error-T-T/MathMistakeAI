// API配置文件
const getApiBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  return envUrl || '/api';
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  HEALTH: '/health',
  IMPORT_TEXT: '/import/text',
  IMPORT_FILE: '/import/file',
  MISTAKES: '/mistakes',
  MISTAKE_BY_ID: '/mistakes/:id',
  ANALYZE: '/analyze',
  GENERATE_QUESTIONS: '/generate/questions',
  GENERATE_PAPER: '/generate/paper',
  EXPORT_PAPER: '/export/paper',
  EXPORT_ANSWERS: '/export/answers',
  STATISTICS: '/statistics'
};

export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
};
