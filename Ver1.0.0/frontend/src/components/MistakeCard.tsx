import React from 'react';
import { Link } from 'react-router-dom';
import { Mistake } from '../types';

interface MistakeCardProps {
  mistake: Mistake;
  onDelete?: (id: string, questionId: string) => void;
}

const MistakeCard: React.FC<MistakeCardProps> = ({ mistake, onDelete }) => {
  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty) {
      case '简单': return 'difficulty-easy';
      case '中等': return 'difficulty-medium';
      case '困难': return 'difficulty-hard';
      default: return 'difficulty-default';
    }
  };

  return (
    <div className="mistake-card">
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(mistake.id, mistake.question_id);
          }}
          className="delete-btn"
          title="删除错题"
        >
          删除
        </button>
      )}

      <Link to={`/mistakes/${mistake.id}`} className="card-link">
        <div className="card-header">
          <span className="question-id">{mistake.question_id}</span>
          <span className={`difficulty-badge ${getDifficultyClass(mistake.difficulty_level)}`}>
            {mistake.difficulty_level}
          </span>
        </div>

        <div className="question-type">{mistake.question_type}</div>
        <div className="question-content">{mistake.question_content}</div>

        <div className="answers-row">
          <div className="answer-box wrong">
            <span className="answer-label">错误答案</span>
            <span className="answer-value">{mistake.wrong_answer}</span>
          </div>
          <div className="answer-box correct">
            <span className="answer-label">正确答案</span>
            <span className="answer-value">{mistake.correct_answer}</span>
          </div>
        </div>

        <div className="tags-row">
          {mistake.knowledge_points.map((point, index) => (
            <span key={index} className="tag">{point}</span>
          ))}
        </div>
      </Link>
    </div>
  );
};

export default MistakeCard;
