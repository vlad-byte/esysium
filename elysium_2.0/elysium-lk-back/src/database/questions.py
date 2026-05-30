from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from src.database.models import Question, Topic, UserAnswer, SampleAnswer
from src.shemas.questions import Question as QuestionSchema, QuestionCreate, SampleAnswer as SampleAnswerSchema, QuestionWithTopic
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete

async def get_questions(session: AsyncSession) -> List[QuestionSchema]:
    result = await session.execute(
        select(Question).options(selectinload(Question.sample_answer))
    )
    questions = result.scalars().all()
    
    question_list = []
    for q in questions:
        sample_answer = None
        if q.sample_answer:
            sample_answer = SampleAnswerSchema(
                id=q.sample_answer.id,
                description=q.sample_answer.description,
                question_id=q.sample_answer.question_id
            )
        
        question_list.append(QuestionSchema(
            id=q.id, 
            name=q.name, 
            stage=q.stage,
            sample_answer=sample_answer
        ))
    
    return question_list

async def get_question_by_id(session: AsyncSession, question_id: int) -> QuestionWithTopic:
    result = await session.execute(
        select(Question)
        .options(selectinload(Question.sample_answer), selectinload(Question.topic))
        .where(Question.id == question_id)
    )
    question = result.scalar_one_or_none()
    
    if not question:
        raise ValueError(f"Question with id {question_id} not found")
    
    sample_answer = None
    if question.sample_answer:
        sample_answer = SampleAnswerSchema(
            id=question.sample_answer.id,
            description=question.sample_answer.description,
            question_id=question.sample_answer.question_id
        )
    
    return QuestionWithTopic(
        id=question.id, 
        name=question.name, 
        stage=question.stage,
        sample_answer=sample_answer,
        topic_name=question.topic.name
    ) 

async def create_question(session: AsyncSession, question_data: QuestionCreate) -> QuestionSchema:
    # Проверяем, что тема существует
    topic = await session.get(Topic, question_data.topic_id)
    if not topic:
        raise ValueError(f"Topic with id {question_data.topic_id} not found")
    
    # Создаем вопрос
    question = Question(
        name=question_data.name,
        topic_id=question_data.topic_id,
        stage=question_data.stage
    )
    session.add(question)
    await session.commit()
    await session.refresh(question)
    return QuestionSchema(id=question.id, name=question.name, stage=question.stage)

async def delete_question_and_related(session: AsyncSession, question_id: int) -> bool:
    # Удалить все user_answers
    await session.execute(delete(UserAnswer).where(UserAnswer.question_id == question_id))
    # Удалить sample_answer
    await session.execute(delete(SampleAnswer).where(SampleAnswer.question_id == question_id))
    # Удалить сам вопрос
    result = await session.execute(delete(Question).where(Question.id == question_id))
    await session.commit()
    return result.rowcount > 0

async def delete_questions_and_related(session: AsyncSession, question_ids: list[int]) -> int:
    # Удалить все user_answers
    await session.execute(delete(UserAnswer).where(UserAnswer.question_id.in_(question_ids)))
    # Удалить sample_answers
    await session.execute(delete(SampleAnswer).where(SampleAnswer.question_id.in_(question_ids)))
    # Удалить вопросы
    result = await session.execute(delete(Question).where(Question.id.in_(question_ids)))
    await session.commit()
    return result.rowcount

async def delete_all_questions(session: AsyncSession) -> int:
    await session.execute(delete(UserAnswer))
    await session.execute(delete(SampleAnswer))
    result = await session.execute(delete(Question))
    await session.commit()
    return result.rowcount
