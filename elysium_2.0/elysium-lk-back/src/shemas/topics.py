from pydantic import BaseModel, ConfigDict
from src.database.models import DifficultyEnum
from typing import Optional, List, Annotated
from pydantic.functional_validators import BeforeValidator

class TopicCreate(BaseModel):
    name: str
    difficulty: Optional[DifficultyEnum] = None

class TopicUpdate(BaseModel):
    name: Optional[str] = None
    difficulty: Optional[DifficultyEnum] = None

class Topic(BaseModel):
    id: int
    name: str
    difficulty: Optional[DifficultyEnum] = None

class TopicWithQuestionCount(BaseModel):
    id: int
    name: str
    difficulty: Optional[DifficultyEnum] = None
    questions_count: int

class TopicCategoryLink(BaseModel):
    topic_id: int
    category_id: int

# Временная схема для избежания циклических импортов
class TopicWithQuestions(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    id: int
    name: str
    difficulty: Optional[DifficultyEnum] = None
    questions: List[dict]  # Используем dict вместо Question для избежания циклических импортов 
    questions_count: int 