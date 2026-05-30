from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func, text
from src.database.models import DifficultyEnum, Question, Category, Topic, TopicCategory, SampleAnswer
from src.shemas.topics import Topic as TopicSchema, TopicCreate, TopicUpdate, TopicWithQuestionCount, TopicCategoryLink, TopicWithQuestions
from src.shemas.questions import Question as QuestionSchema, SampleAnswer as SampleAnswerSchema
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

async def get_topic_with_questions(session: AsyncSession, topic_id: int) -> TopicWithQuestions:
    # Загружаем тему с вопросами и их примерами ответов
    result = await session.execute(
        select(Topic)
        .options(selectinload(Topic.questions).selectinload(Question.sample_answer))
        .where(Topic.id == topic_id)
    )
    topic = result.scalar_one_or_none()
    
    if not topic:
        raise ValueError(f"Topic with id {topic_id} not found")
    
    # Формируем список вопросов с примерами ответов
    questions_list = []
    for question in topic.questions:
        sample_answer = None
        if question.sample_answer:
            sample_answer = {
                "id": question.sample_answer.id,
                "description": question.sample_answer.description,
            }
        
        questions_list.append({
            "id": question.id,
            "name": question.name,
            "stage": question.stage,
            "sample_answer": sample_answer
        })
    
    return TopicWithQuestions(
        id=topic.id,
        name=topic.name,
        difficulty=topic.difficulty,
        questions=questions_list,
        questions_count=len(questions_list)
    )

async def create_topic(session: AsyncSession, topic_data: TopicCreate) -> TopicSchema:
    topic = Topic(
        name=topic_data.name,
        difficulty=topic_data.difficulty
    )
    session.add(topic)
    await session.commit()
    await session.refresh(topic)
    return TopicSchema(id=topic.id, name=topic.name, difficulty=topic.difficulty)

async def update_topic(session: AsyncSession, topic_id: int, topic_data: TopicUpdate) -> TopicSchema:
    # Проверяем, что тема существует
    topic = await session.get(Topic, topic_id)
    if not topic:
        raise ValueError(f"Topic with id {topic_id} not found")
    
    # Обновляем поля, если они предоставлены
    if topic_data.name is not None:
        topic.name = topic_data.name
    
    if topic_data.difficulty is not None:
        print(f"Updating difficulty to: {topic_data.difficulty}")
        print(f"Type of difficulty: {type(topic_data.difficulty)}")
        
        # Проверяем, что значение является правильным enum
        if isinstance(topic_data.difficulty, str):
            # Если передана строка, пытаемся преобразовать в enum
            try:
                if topic_data.difficulty == "easy":
                    topic_data.difficulty = DifficultyEnum.easy
                elif topic_data.difficulty == "medium":
                    topic_data.difficulty = DifficultyEnum.medium
                elif topic_data.difficulty == "hard":
                    topic_data.difficulty = DifficultyEnum.hard
                elif topic_data.difficulty == "Легко":
                    topic_data.difficulty = DifficultyEnum.easy
                elif topic_data.difficulty == "Средне":
                    topic_data.difficulty = DifficultyEnum.medium
                elif topic_data.difficulty == "Сложно":
                    topic_data.difficulty = DifficultyEnum.hard
                else:
                    raise ValueError(f"Invalid difficulty value: {topic_data.difficulty}")
            except Exception as e:
                raise ValueError(f"Error converting difficulty value: {str(e)}")
        
        topic.difficulty = topic_data.difficulty
    
    await session.commit()
    await session.refresh(topic)
    return TopicSchema(id=topic.id, name=topic.name, difficulty=topic.difficulty)

async def link_topic_to_category(session: AsyncSession, link_data: TopicCategoryLink) -> dict:
    # Проверяем, что тема и категория существуют
    topic = await session.get(Topic, link_data.topic_id)
    category = await session.get(Category, link_data.category_id)
    
    if not topic:
        raise ValueError(f"Topic with id {link_data.topic_id} not found")
    if not category:
        raise ValueError(f"Category with id {link_data.category_id} not found")
    
    # Проверяем, что связь уже не существует
    existing_link = await session.execute(
        select(TopicCategory).where(
            TopicCategory.topic_id == link_data.topic_id,
            TopicCategory.category_id == link_data.category_id
        )
    )
    
    if existing_link.scalar_one_or_none():
        raise ValueError(f"Topic {link_data.topic_id} is already linked to category {link_data.category_id}")
    
    # Создаем связь
    topic_category = TopicCategory(
        topic_id=link_data.topic_id,
        category_id=link_data.category_id
    )
    session.add(topic_category)
    await session.commit()
    
    return {"message": f"Topic {link_data.topic_id} successfully linked to category {link_data.category_id}"}