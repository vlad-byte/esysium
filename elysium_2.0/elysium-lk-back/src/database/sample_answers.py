from sqlalchemy.future import select
from src.database.models import Question, SampleAnswer
from src.shemas.questions import SampleAnswer as SampleAnswerSchema, SampleAnswerCreate, SampleAnswerUpdate
from sqlalchemy.ext.asyncio import AsyncSession

async def create_sample_answer(session: AsyncSession, question_id: int, answer_data: SampleAnswerCreate) -> SampleAnswerSchema:
    # Проверяем, что вопрос существует
    question = await session.get(Question, question_id)
    if not question:
        raise ValueError(f"Question with id {question_id} not found")
    
    # Проверяем, что у вопроса еще нет примера ответа
    existing_answer = await session.execute(
        select(SampleAnswer).where(SampleAnswer.question_id == question_id)
    )
    
    if existing_answer.scalar_one_or_none():
        raise ValueError(f"Question {question_id} already has a sample answer")
    
    # Создаем пример ответа
    sample_answer = SampleAnswer(
        description=answer_data.description,
        question_id=question_id
    )
    session.add(sample_answer)
    await session.commit()
    await session.refresh(sample_answer)
    return SampleAnswerSchema(id=sample_answer.id, description=sample_answer.description, question_id=sample_answer.question_id)

async def update_sample_answer(session: AsyncSession, question_id: int, answer_data: SampleAnswerUpdate) -> SampleAnswerSchema:
    # Проверяем, что вопрос существует
    question = await session.get(Question, question_id)
    if not question:
        raise ValueError(f"Question with id {question_id} not found")
    
    # Находим существующий пример ответа
    sample_answer = await session.execute(
        select(SampleAnswer).where(SampleAnswer.question_id == question_id)
    )
    sample_answer = sample_answer.scalar_one_or_none()
    
    if not sample_answer:
        raise ValueError(f"Question {question_id} does not have a sample answer")
    
    # Обновляем описание
    sample_answer.description = answer_data.description
    await session.commit()
    await session.refresh(sample_answer)
    return SampleAnswerSchema(id=sample_answer.id, description=sample_answer.description, question_id=sample_answer.question_id)

async def delete_sample_answer(session: AsyncSession, question_id: int) -> dict:
    # Проверяем, что вопрос существует
    question = await session.get(Question, question_id)
    if not question:
        raise ValueError(f"Question with id {question_id} not found")
    
    # Находим существующий пример ответа
    sample_answer = await session.execute(
        select(SampleAnswer).where(SampleAnswer.question_id == question_id)
    )
    sample_answer = sample_answer.scalar_one_or_none()
    
    if not sample_answer:
        raise ValueError(f"Question {question_id} does not have a sample answer")
    
    # Удаляем пример ответа
    await session.delete(sample_answer)
    await session.commit()
    
    return {"message": f"Sample answer for question {question_id} has been deleted"} 