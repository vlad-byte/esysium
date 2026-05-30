from pydantic import BaseModel
from src.database.models import CompletenessEnum
from typing import Optional, List
from datetime import datetime

class UserAnswerCreate(BaseModel):
    question_id: int
    answer_body: str
    answer_volume: str
    is_anonymous: bool = True
    user_id: Optional[int] = None
    completeness: CompletenessEnum
    feedback: Optional[str] = None

class UserAnswerCreateAPI(BaseModel):
    """Схема для создания ответа через API (без answer_volume, так как он обрабатывается отдельно)"""
    question_id: int
    answer_body: str
    is_anonymous: bool = True
    user_id: Optional[int] = None
    completeness: CompletenessEnum
    feedback: Optional[str] = None

class UserAnswerUpdate(BaseModel):
    answer_body: Optional[str] = None
    answer_volume: Optional[str] = None
    is_anonymous: Optional[bool] = None
    user_id: Optional[int] = None
    completeness: Optional[CompletenessEnum] = None
    feedback: Optional[str] = None

class UserAnswer(BaseModel):
    id: int
    created_at: datetime
    question_id: int
    answer_body: str
    answer_volume: str
    is_anonymous: bool
    user_id: Optional[int] = None
    completeness: CompletenessEnum
    feedback: Optional[str] = None

class QuestionProgressDetail(BaseModel):
    question_id: int
    question_name: str
    has_answer: bool
    answer_completeness: Optional[str] = None
    progress_modifier: float
    is_correct: bool

class TopicProgress(BaseModel):
    topic_id: int
    topic_name: str
    topic_difficulty: Optional[str] = None
    total_questions: int
    answered_questions: int
    correct_answers: int
    progress_percentage: float
    progress_details: List[QuestionProgressDetail]

class TopicProgressSummary(BaseModel):
    topic_id: int
    topic_name: str
    topic_difficulty: str
    topic_weight: float
    progress_percentage: float
    weighted_progress: float
    total_questions: int
    answered_questions: int
    correct_answers: int

class CategoryProgress(BaseModel):
    category_id: int
    category_name: str
    total_topics: int
    total_weighted_progress: float
    total_weight: float
    progress_percentage: float
    topics_progress: List[TopicProgressSummary] 