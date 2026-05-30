from sqlalchemy import Integer, String, Enum, ForeignKey, Table, DateTime, Boolean, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
import enum
from typing import Optional
from datetime import datetime

class Base(DeclarativeBase):
    pass

class StageEnum(str, enum.Enum):
    technical = "technical"
    hr = "hr"
    soft = "soft"
    other = "other"

class DifficultyEnum(str, enum.Enum):
    easy = "Легко"
    medium = "Средне"
    hard = "Сложно"

class CompletenessEnum(str, enum.Enum):
    complete = "Полный ответ"
    incomplete = "Верный но неполный ответ"
    incorrect = "Неверный ответ"

class TopicCategory(Base):
    __tablename__ = "topic_category"
    topic_id: Mapped[int] = mapped_column(ForeignKey("topics.id"), primary_key=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), primary_key=True)

class Category(Base):
    __tablename__ = "categories"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    topics = relationship("Topic", secondary="topic_category", back_populates="categories")

class Topic(Base):
    __tablename__ = "topics"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    difficulty: Mapped[Optional[DifficultyEnum]] = mapped_column(
        Enum(DifficultyEnum, values_callable=lambda obj: [e.value for e in obj]), 
        nullable=True, 
        default=None
    )
    questions = relationship("Question", back_populates="topic")
    categories = relationship("Category", secondary="topic_category", back_populates="topics")

class Question(Base):
    __tablename__ = "questions"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    stage: Mapped[StageEnum] = mapped_column(Enum(StageEnum), nullable=False)
    resourse: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    topic_id: Mapped[int] = mapped_column(ForeignKey("topics.id"))
    topic = relationship("Topic", back_populates="questions")
    sample_answer = relationship("SampleAnswer", back_populates="question", uselist=False)
    user_answers = relationship("UserAnswer", back_populates="question")

class SampleAnswer(Base):
    __tablename__ = "sample_answers"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    description: Mapped[str] = mapped_column(String, nullable=False)
    question_id: Mapped[int] = mapped_column(ForeignKey("questions.id"), unique=True)
    question = relationship("Question", back_populates="sample_answer")

class UserAnswer(Base):
    __tablename__ = "user_answers"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    question_id: Mapped[int] = mapped_column(ForeignKey("questions.id"), nullable=False)
    answer_body: Mapped[str] = mapped_column(String, nullable=False)
    answer_volume: Mapped[str] = mapped_column(String, nullable=False)  # количество символов или минут
    is_anonymous: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # если не анонимный
    completeness: Mapped[CompletenessEnum] = mapped_column(Enum(CompletenessEnum), nullable=False)
    feedback: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    question = relationship("Question", back_populates="user_answers") 

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (UniqueConstraint('username', name='uq_user_username'),) 