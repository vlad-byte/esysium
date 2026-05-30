from pydantic import BaseModel
from typing import List
from .topics import TopicWithQuestionCount

class CategoryCreate(BaseModel):
    name: str

class Category(BaseModel):
    id: int
    name: str

class CategoryWithTopics(BaseModel):
    id: int
    name: str
    topics: List[TopicWithQuestionCount]
    total_questions: int
    total_topics: int 