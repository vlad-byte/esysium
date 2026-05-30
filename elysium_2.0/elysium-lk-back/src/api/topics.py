from fastapi import APIRouter, Depends, HTTPException
from src.shemas.topics import Topic, TopicCreate, TopicUpdate, TopicCategoryLink, TopicWithQuestions
from src.database.topics import create_topic, update_topic, link_topic_to_category, get_topic_with_questions
from src.database.db import get_session
from sqlalchemy.ext.asyncio import AsyncSession

topics_router = APIRouter(prefix="/topics", tags=["topics"])

@topics_router.get("/{topic_id}/", response_model=TopicWithQuestions)
async def get_topic_with_questions_endpoint(
    topic_id: int,
    session: AsyncSession = Depends(get_session)
):
    try:
        return await get_topic_with_questions(session, topic_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@topics_router.put("/{topic_id}/", response_model=Topic)
async def update_topic_endpoint(
    topic_id: int,
    topic_data: TopicUpdate, 
    session: AsyncSession = Depends(get_session)
):
    try:
        return await update_topic(session, topic_id, topic_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@topics_router.post("/", response_model=Topic)
async def create_topic_endpoint(
    topic_data: TopicCreate, 
    session: AsyncSession = Depends(get_session)
):
    return await create_topic(session, topic_data)

@topics_router.post("/link-to-category/")
async def link_topic_to_category_endpoint(
    link_data: TopicCategoryLink, 
    session: AsyncSession = Depends(get_session)
):
    try:
        return await link_topic_to_category(session, link_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))