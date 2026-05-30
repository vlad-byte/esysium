from fastapi import APIRouter, Depends, HTTPException
from src.shemas.categories import Category, CategoryCreate, CategoryWithTopics
from src.database.categories import get_categories, create_category, get_category_with_topics
from src.database.db import get_session
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

categories_router = APIRouter(prefix="/categories", tags=["categories"])

@categories_router.get("/", response_model=List[Category])
async def list_categories(session: AsyncSession = Depends(get_session)):
    return await get_categories(session)

@categories_router.post("/", response_model=Category)
async def create_category_endpoint(
    category_data: CategoryCreate, 
    session: AsyncSession = Depends(get_session)
):
    return await create_category(session, category_data)

@categories_router.get("/{category_id}/", response_model=CategoryWithTopics)
async def get_category_with_topics_endpoint(
    category_id: int,
    session: AsyncSession = Depends(get_session)
):
    try:
        return await get_category_with_topics(session, category_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) 