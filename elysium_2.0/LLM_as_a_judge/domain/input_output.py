from pydantic import BaseModel
from typing import List, Optional


class AssessmentResponse(BaseModel):
    correct: List[str]
    incorrect: List[str]
    what_didnt_say: List[str]
    score: int


class AnswerRequest(BaseModel):
    user_answer: str
    real_answer: List[str]


class CardAnswerRequest(BaseModel):
    question: str
    answer: str
    resources: str
    history: List[str]
    user_answer: str


class AnswerResponse(BaseModel):
    correct: List[str]
    incorrect: List[str]
    what_didnt_say: List[str]
    score: int


class CardAnswerResponse(BaseModel):
    response: str


class MessageInterviewMode(BaseModel):
    user_message: Optional[str]
    assistent_message: str


class HistoryInterviewMode(BaseModel):
    history_list: List[MessageInterviewMode] = []


class LLMOutputInterviewMode(BaseModel):
    incorrect: str
    what_didnt_say: str
    next_question: Optional[str]
    is_complited: bool


class OutputInterviewMode(BaseModel):
    next_question: Optional[str]
    feedback: Optional[AssessmentResponse]
    is_complited: bool
    history_list: HistoryInterviewMode


class InterviewAnswerRequest(BaseModel):
    user_answer: str
    real_answer: List[str]
    history: HistoryInterviewMode
