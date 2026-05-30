from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import or_
from src.database.models import UserAnswer, Question, Topic, Category
from src.shemas.user_answers import UserAnswer as UserAnswerSchema, UserAnswerCreate, UserAnswerUpdate
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

# Модификаторы для разных типов ответов
COMPLETENESS_MODIFIERS = {
    "Полный ответ": 1.0,           # 100% - полностью верный ответ
    "Верный но неполный ответ": 0.7,  # 70% - верный, но неполный
    "Неверный ответ": 0.0          # 0% - неверный ответ
}

# Веса для разных уровней сложности тем
DIFFICULTY_WEIGHTS = {
    "Легко": 1.0,      # Базовый вес
    "Средне": 1.5,     # Средняя сложность весит больше
    "Сложно": 2.0      # Сложные темы весят больше всего
}

async def get_user_answers(session: AsyncSession) -> List[UserAnswerSchema]:
    """Получить все ответы пользователей"""
    result = await session.execute(
        select(UserAnswer).options(selectinload(UserAnswer.question))
    )
    user_answers = result.scalars().all()
    
    return [
        UserAnswerSchema(
            id=answer.id,
            created_at=answer.created_at,
            question_id=answer.question_id,
            answer_body=answer.answer_body,
            # Не возвращаем base64 аудио в API (очень большой payload)
            answer_volume="",
            is_anonymous=answer.is_anonymous,
            user_id=answer.user_id,
            completeness=answer.completeness,
            feedback=answer.feedback  # <-- добавлено
        )
        for answer in user_answers
    ]

async def get_user_answers_by_question(session: AsyncSession, question_id: int) -> List[UserAnswerSchema]:
    """Получить все ответы пользователей на конкретный вопрос"""
    result = await session.execute(
        select(UserAnswer)
        .options(selectinload(UserAnswer.question))
        .where(UserAnswer.question_id == question_id)
    )
    user_answers = result.scalars().all()
    
    return [
        UserAnswerSchema(
            id=answer.id,
            created_at=answer.created_at,
            question_id=answer.question_id,
            answer_body=answer.answer_body,
            # Не возвращаем base64 аудио в API (очень большой payload)
            answer_volume="",
            is_anonymous=answer.is_anonymous,
            user_id=answer.user_id,
            completeness=answer.completeness,
            feedback=answer.feedback  # <-- добавлено
        )
        for answer in user_answers
    ]

async def get_user_answers_by_topic(session: AsyncSession, topic_id: int, user_id: int = None) -> List[UserAnswerSchema]:
    """Получить все ответы пользователя на вопросы конкретной темы"""
    query = (
        select(UserAnswer)
        .options(selectinload(UserAnswer.question))
        .join(Question, UserAnswer.question_id == Question.id)
        .where(Question.topic_id == topic_id)
    )
    
    if user_id is not None:
        query = query.where(UserAnswer.user_id == user_id)
    else:
        # Локальная сессия без user_id: анонимные + ответы без привязки к аккаунту
        query = query.where(
            or_(UserAnswer.is_anonymous == True, UserAnswer.user_id.is_(None))
        )
    
    result = await session.execute(query)
    user_answers = result.scalars().all()
    
    return [
        UserAnswerSchema(
            id=answer.id,
            created_at=answer.created_at,
            question_id=answer.question_id,
            answer_body=answer.answer_body,
            # Не возвращаем base64 аудио в API (очень большой payload)
            answer_volume="",
            is_anonymous=answer.is_anonymous,
            user_id=answer.user_id,
            completeness=answer.completeness,
            feedback=answer.feedback  # <-- добавлено
        )
        for answer in user_answers
    ]

async def calculate_topic_progress(session: AsyncSession, topic_id: int, user_id: int = None) -> Dict[str, Any]:
    """Рассчитать прогресс пользователя по теме"""
    # Проверяем, что тема существует
    topic = await session.get(Topic, topic_id)
    if not topic:
        raise ValueError(f"Topic with id {topic_id} not found")
    
    # Получаем все вопросы темы
    questions_result = await session.execute(
        select(Question).where(Question.topic_id == topic_id)
    )
    questions = questions_result.scalars().all()
    total_questions = len(questions)
    
    if total_questions == 0:
        return {
            "topic_id": topic_id,
            "topic_name": topic.name,
            "topic_difficulty": topic.difficulty.value if topic.difficulty else None,
            "total_questions": 0,
            "answered_questions": 0,
            "correct_answers": 0,
            "progress_percentage": 0.0,
            "progress_details": []
        }
    
    # Получаем ответы пользователя на вопросы этой темы
    user_answers = await get_user_answers_by_topic(session, topic_id, user_id)
    
    # Создаем словарь для хранения лучшего ответа на каждый вопрос
    best_answers = {}
    
    for answer in user_answers:
        question_id = answer.question_id
        modifier = COMPLETENESS_MODIFIERS.get(answer.completeness.value, 0.0)
        
        # Если у нас уже есть ответ на этот вопрос, берем лучший
        if question_id in best_answers:
            current_modifier = COMPLETENESS_MODIFIERS.get(best_answers[question_id].completeness.value, 0.0)
            if modifier > current_modifier:
                best_answers[question_id] = answer
        else:
            best_answers[question_id] = answer
    
    # Рассчитываем прогресс
    total_progress = 0.0
    correct_answers = 0
    
    progress_details = []
    
    for question in questions:
        question_progress = 0.0
        is_correct = False
        
        if question.id in best_answers:
            answer = best_answers[question.id]
            modifier = COMPLETENESS_MODIFIERS.get(answer.completeness.value, 0.0)
            question_progress = modifier
            is_correct = answer.completeness.value != "Неверный ответ"
            if is_correct:
                correct_answers += 1
        else:
            # Нет ответа на этот вопрос
            question_progress = 0.0
            is_correct = False
        
        total_progress += question_progress
        
        progress_details.append({
            "question_id": question.id,
            "question_name": question.name,
            "has_answer": question.id in best_answers,
            "answer_completeness": best_answers[question.id].completeness.value if question.id in best_answers else None,
            "progress_modifier": COMPLETENESS_MODIFIERS.get(best_answers[question.id].completeness.value, 0.0) if question.id in best_answers else 0.0,
            "is_correct": is_correct
        })
    
    # Рассчитываем процент прогресса
    progress_percentage = (total_progress / total_questions) * 100 if total_questions > 0 else 0.0
    
    return {
        "topic_id": topic_id,
        "topic_name": topic.name,
        "topic_difficulty": topic.difficulty.value if topic.difficulty else None,
        "total_questions": total_questions,
        "answered_questions": len(best_answers),
        "correct_answers": correct_answers,
        "progress_percentage": round(progress_percentage, 2),
        "progress_details": progress_details
    }

async def calculate_category_progress(session: AsyncSession, category_id: int, user_id: int = None) -> Dict[str, Any]:
    """Рассчитать прогресс пользователя по категории с учетом сложности тем"""
    # Проверяем, что категория существует
    category = await session.get(Category, category_id)
    if not category:
        raise ValueError(f"Category with id {category_id} not found")
    
    # Получаем все темы категории
    topics_result = await session.execute(
        select(Topic)
        .join(Topic.categories)
        .where(Category.id == category_id)
    )
    topics = topics_result.scalars().all()
    
    if not topics:
        return {
            "category_id": category_id,
            "category_name": category.name,
            "total_topics": 0,
            "total_weighted_progress": 0.0,
            "total_weight": 0.0,
            "progress_percentage": 0.0,
            "topics_progress": []
        }
    
    # Рассчитываем прогресс для каждой темы
    topics_progress = []
    total_weighted_progress = 0.0
    total_weight = 0.0
    
    for topic in topics:
        topic_progress = await calculate_topic_progress(session, topic.id, user_id)
        
        # Получаем вес темы на основе сложности
        difficulty = topic.difficulty.value if topic.difficulty else "Легко"
        weight = DIFFICULTY_WEIGHTS.get(difficulty, 1.0)
        
        # Рассчитываем взвешенный прогресс
        weighted_progress = (topic_progress["progress_percentage"] / 100.0) * weight
        
        total_weighted_progress += weighted_progress
        total_weight += weight
        
        topics_progress.append({
            "topic_id": topic.id,
            "topic_name": topic.name,
            "topic_difficulty": difficulty,
            "topic_weight": weight,
            "progress_percentage": topic_progress["progress_percentage"],
            "weighted_progress": round(weighted_progress, 2),
            "total_questions": topic_progress["total_questions"],
            "answered_questions": topic_progress["answered_questions"],
            "correct_answers": topic_progress["correct_answers"]
        })
    
    # Рассчитываем общий процент прогресса категории
    progress_percentage = (total_weighted_progress / total_weight) * 100 if total_weight > 0 else 0.0
    
    return {
        "category_id": category_id,
        "category_name": category.name,
        "total_topics": len(topics),
        "total_weighted_progress": round(total_weighted_progress, 2),
        "total_weight": round(total_weight, 2),
        "progress_percentage": round(progress_percentage, 2),
        "topics_progress": topics_progress
    }

async def create_user_answer(session: AsyncSession, answer_data: UserAnswerCreate) -> UserAnswerSchema:
    """Создать новый ответ пользователя"""
    # Проверяем, что вопрос существует
    question = await session.get(Question, answer_data.question_id)
    if not question:
        raise ValueError(f"Question with id {answer_data.question_id} not found")
    
    # Создаем ответ пользователя
    user_answer = UserAnswer(
        question_id=answer_data.question_id,
        answer_body=answer_data.answer_body,
        answer_volume=answer_data.answer_volume,
        is_anonymous=answer_data.is_anonymous,
        user_id=answer_data.user_id,
        completeness=answer_data.completeness,
        feedback=answer_data.feedback  # <-- добавлено сохранение feedback
    )
    
    session.add(user_answer)
    await session.commit()
    await session.refresh(user_answer)
    
    return UserAnswerSchema(
        id=user_answer.id,
        created_at=user_answer.created_at,
        question_id=user_answer.question_id,
        answer_body=user_answer.answer_body,
        # Не возвращаем base64 аудио в API (очень большой payload)
        answer_volume="",
        is_anonymous=user_answer.is_anonymous,
        user_id=user_answer.user_id,
        completeness=user_answer.completeness,
        feedback=user_answer.feedback  # <-- добавлено возврат feedback
    )

async def update_user_answer(session: AsyncSession, answer_id: int, answer_data: UserAnswerUpdate) -> UserAnswerSchema:
    """Обновить ответ пользователя"""
    # Проверяем, что ответ существует
    user_answer = await session.get(UserAnswer, answer_id)
    if not user_answer:
        raise ValueError(f"UserAnswer with id {answer_id} not found")
    
    # Обновляем поля, если они предоставлены
    if answer_data.answer_body is not None:
        user_answer.answer_body = answer_data.answer_body
    if answer_data.answer_volume is not None:
        user_answer.answer_volume = answer_data.answer_volume
    if answer_data.is_anonymous is not None:
        user_answer.is_anonymous = answer_data.is_anonymous
    if answer_data.user_id is not None:
        user_answer.user_id = answer_data.user_id
    if answer_data.completeness is not None:
        user_answer.completeness = answer_data.completeness
    
    await session.commit()
    await session.refresh(user_answer)
    
    return UserAnswerSchema(
        id=user_answer.id,
        created_at=user_answer.created_at,
        question_id=user_answer.question_id,
        answer_body=user_answer.answer_body,
        # Не возвращаем base64 аудио в API (очень большой payload)
        answer_volume="",
        is_anonymous=user_answer.is_anonymous,
        user_id=user_answer.user_id,
        completeness=user_answer.completeness,
        feedback=user_answer.feedback  # <-- добавлено возврат feedback
    )

async def delete_user_answer(session: AsyncSession, answer_id: int) -> dict:
    """Удалить ответ пользователя"""
    # Проверяем, что ответ существует
    user_answer = await session.get(UserAnswer, answer_id)
    if not user_answer:
        raise ValueError(f"UserAnswer with id {answer_id} not found")
    
    # Удаляем ответ
    await session.delete(user_answer)
    await session.commit()
    
    return {"message": f"UserAnswer with id {answer_id} has been deleted"} 