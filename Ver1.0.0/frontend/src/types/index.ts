// 错题数据类型
export interface Mistake {
  id: string;
  question_id: string;
  question_type: string;
  question_content: string;
  wrong_process: string;
  wrong_answer: string;
  correct_answer: string;
  knowledge_points: string[];
  difficulty_level: string;
  message?: string;
}

// 导入响应类型
export interface ImportResponse {
  success: boolean;
  message: string;
  mistakes?: Mistake[];
}

// AI分析结果类型
export interface AnalysisResult {
  mistake_id: string;
  formula_extraction: string[];
  error_type: string; // 概念错误、计算错误、方法错误
  error_reason: string;
  step_by_step_solution: string[];
  general_method: string;
  specific_strategy?: string;
}

// 题目生成参数类型
export interface GenerationParams {
  similarity: 'only_numbers' | 'same_type' | 'mixed_knowledge';
  quantity: number;
  difficulty: 'easy' | 'medium' | 'hard';
  knowledge_points: string[];
  base_mistake_id?: string;
}

// 生成的题目类型
export interface GeneratedQuestion {
  id: string;
  source_mistake_id: string;
  question_text: string;
  answer: string;
  difficulty: string;
  knowledge_points: string[];
  similarity_level: string;
}

// 试卷生成参数类型
export interface PaperParams {
  title: string;
  question_count: number;
  difficulty_distribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  knowledge_points: string[];
  include_generated?: boolean;
}

// 试卷类型
export interface Paper {
  id: string;
  title: string;
  questions: (Mistake | GeneratedQuestion)[];
  generated_at: string;
  statistics: {
    total_questions: number;
    difficulty_distribution: {
      easy: number;
      medium: number;
      hard: number;
    };
    knowledge_coverage: string[];
  };
}

// 统计数据类型
export interface Statistics {
  recent_trend: {
    date: string;
    count: number;
  }[];
  knowledge_distribution: {
    name: string;
    value: number;
  }[];
  difficulty_distribution: {
    name: string;
    value: number;
  }[];
  total_mistakes: number;
  average_difficulty: number;
  most_common_error_types: string[];
}
