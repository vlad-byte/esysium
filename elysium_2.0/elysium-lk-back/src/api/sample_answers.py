from fastapi import APIRouter, Depends, HTTPException
from src.shemas.questions import SampleAnswer, SampleAnswerCreate, SampleAnswerUpdate
from src.database.sample_answers import create_sample_answer, update_sample_answer, delete_sample_answer
from src.database.db import get_session
from sqlalchemy.ext.asyncio import AsyncSession

sample_answers_router = APIRouter(prefix="/sample-answers", tags=["sample-answers"])

@sample_answers_router.post("/{question_id}/", response_model=SampleAnswer)
async def create_sample_answer_endpoint(
    question_id: int,
    answer_data: SampleAnswerCreate, 
    session: AsyncSession = Depends(get_session)
):
    try:
        return await create_sample_answer(session, question_id, answer_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@sample_answers_router.put("/{question_id}/", response_model=SampleAnswer)
async def update_sample_answer_endpoint(
    question_id: int,
    answer_data: SampleAnswerUpdate, 
    session: AsyncSession = Depends(get_session)
):
    try:
        return await update_sample_answer(session, question_id, answer_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@sample_answers_router.delete("/{question_id}/")
async def delete_sample_answer_endpoint(
    question_id: int,
    session: AsyncSession = Depends(get_session)
):
    try:
        return await delete_sample_answer(session, question_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) 