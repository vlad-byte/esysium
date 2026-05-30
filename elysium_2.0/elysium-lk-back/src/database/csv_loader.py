import pandas as pd
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.database.models import Category, Topic, Question, SampleAnswer, TopicCategory, StageEnum
from typing import Optional

async def load_data_to_db(
    session: AsyncSession,
    questions_csv: str,
    topics_csv: str,
    subtopics_csv: str,
    skip: int = 0,
    limit: int | None = None
) -> int:
    # 1. Загрузка категорий (Category)
    topics_df = pd.read_csv(topics_csv)
    categories = {}
    for _, row in topics_df.iterrows():
        category = Category(id=int(row['topic_id']), name=row['Name'])
        await session.merge(category)
        categories[row['topic_id']] = category
    await session.commit()

    # 2. Загрузка топиков (Topic)
    subtopics_df = pd.read_csv(subtopics_csv)
    topics = {}
    for _, row in subtopics_df.iterrows():
        topic = Topic(
            id=int(row['subtopic_id']),
            name=row['Name'],
            difficulty=None
        )
        await session.merge(topic)
        topics[(row['topic_id'], row['subtopic_id'])] = topic
    await session.commit()

    # 3. Связь Category <-> Topic через TopicCategory
    for _, row in subtopics_df.iterrows():
        tc = TopicCategory(
            topic_id=int(row['subtopic_id']),
            category_id=int(row['topic_id'])
        )
        await session.merge(tc)
    await session.commit()

    # 4. Загрузка вопросов (Question) и ответов (SampleAnswer)
    questions_df = pd.read_csv(questions_csv)
    imported = 0
    skipped = 0
    # Применяем skip и limit
    if limit is not None:
        questions_iter = questions_df.iloc[skip:skip+limit].iterrows()
    else:
        questions_iter = questions_df.iloc[skip:].iterrows()
    for _, row in questions_iter:
        topic_id = int(row['subtopic_id'])

        # Проверяем, не существует ли уже такой вопрос (дедупликация)
        existing = await session.execute(
            select(Question).where(
                Question.name == row['question'],
                Question.topic_id == topic_id
            )
        )
        if existing.scalar_one_or_none() is not None:
            skipped += 1
            continue

        # StageEnum: попробуйте привести к одному из значений, иначе default
        try:
            stage = StageEnum(row['type_interview'])
        except Exception:
            stage = StageEnum.other

        resourse_val = row.get('resourse')
        question = Question(
            name=row['question'],
            stage=stage,
            topic_id=topic_id,
            resourse=resourse_val if pd.notna(resourse_val) else None,
        )
        session.add(question)
        await session.flush()  # чтобы получить question.id

        # SampleAnswer теперь из new_markdown_answer
        if pd.notna(row.get('new_markdown_answer')):
            sample_answer = SampleAnswer(
                description=row['new_markdown_answer'],
                question_id=question.id
            )
            session.add(sample_answer)
        imported += 1
    await session.commit()
    return imported 