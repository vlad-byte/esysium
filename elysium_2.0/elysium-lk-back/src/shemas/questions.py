from pydantic import BaseModel
from src.database.models import StageEnum
from typing import Optional

class SampleAnswerCreate(BaseModel):
    description: str

class SampleAnswerUpdate(BaseModel):
    description: str

class SampleAnswer(BaseModel):
    id: int
    description: str

class Question(BaseModel):
    id: int
    name: str
    stage: StageEnum
    resourse: Optional[str] = None
    sample_answer: Optional[SampleAnswer] = None

class QuestionWithTopic(BaseModel):
    id: int
    name: str
    stage: StageEnum
    resourse: Optional[str] = None
    sample_answer: Optional[SampleAnswer] = None
    topic_name: str

class QuestionCreate(BaseModel):
    name: str
    topic_id: int
    stage: Optional[StageEnum] = StageEnum.other 