from sqlalchemy.future import select
from sqlalchemy import func
from src.database.models import Question, Category, Topic, TopicCategory
from src.shemas.categories import Category as CategorySchema, CategoryCreate, CategoryWithTopics
from src.shemas.topics import TopicWithQuestionCount
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

async def get_categories(session: AsyncSession) -> List[CategorySchema]:
    result = await session.execute(select(Category))
    categories = result.scalars().all()
    return [CategorySchema(id=c.id, name=c.name) for c in categories]

async def create_category(session: AsyncSession, category_data: CategoryCreate) -> CategorySchema:
    category = Category(name=category_data.name)
    session.add(category)
    await session.commit()
    await session.refresh(category)
    return CategorySchema(id=category.id, name=category.name)

async def get_category_with_topics(session: AsyncSession, category_id: int) -> CategoryWithTopics:
    # Проверяем, что категория существует
    category = await session.get(Category, category_id)
    if not category:
        raise ValueError(f"Category with id {category_id} not found")
    
    # Получаем темы в категории с количеством вопросов
    result = await session.execute(
        select(Topic, func.count(Question.id).label('questions_count'))
        .join(TopicCategory, Topic.id == TopicCategory.topic_id)
        .outerjoin(Question, Topic.id == Question.topic_id)
        .where(TopicCategory.category_id == category_id)
        .group_by(Topic.id, Topic.name, Topic.difficulty)
    )
    
    topics_with_count = []
    total_questions = 0
    total_topics = 0
    
    for topic, questions_count in result.all():
        topics_with_count.append(TopicWithQuestionCount(
            id=topic.id,
            name=topic.name,
            difficulty=topic.difficulty,
            questions_count=questions_count
        ))
        total_questions += questions_count
        total_topics += 1
    
    return CategoryWithTopics(
        id=category.id,
        name=category.name,
        topics=topics_with_count,
        total_questions=total_questions,
        total_topics=total_topics
    ) 