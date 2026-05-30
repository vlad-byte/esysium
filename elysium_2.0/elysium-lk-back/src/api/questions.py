from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, Body
from src.shemas.questions import Question, QuestionCreate, QuestionWithTopic
from typing import List, Dict
from src.database.db import get_session
from sqlalchemy.ext.asyncio import AsyncSession
from src.database.questions import get_questions, create_question, get_question_by_id, delete_question_and_related, delete_questions_and_related, delete_all_questions
from src.database.csv_loader import load_data_to_db
import tempfile
import shutil

questions_router = APIRouter(prefix="/questions", tags=["questions"])

@questions_router.get("/", response_model=List[Question])
async def list_questions(session: AsyncSession = Depends(get_session)):
    return await get_questions(session)

@questions_router.get("/{question_id}/", response_model=QuestionWithTopic)
async def get_question(question_id: int, session: AsyncSession = Depends(get_session)):
    try:
        return await get_question_by_id(session, question_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@questions_router.post("/", response_model=Question)
async def create_question_endpoint(
    question_data: QuestionCreate, 
    session: AsyncSession = Depends(get_session)
):
    try:
        return await create_question(session, question_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@questions_router.post("/import_csv/")
async def import_questions_csv(
    questions_file: UploadFile = File(...),
    topics_file: UploadFile = File(...),
    subtopics_file: UploadFile = File(...),
    skip: int = Query(0, description="Сколько вопросов пропустить с начала файла"),
    limit: int | None = Query(None, description="Сколько вопросов загрузить из файла (None = все)"),
    session: AsyncSession = Depends(get_session)
):
    # Сохраняем временные файлы
    with tempfile.NamedTemporaryFile(delete=False) as qf, \
         tempfile.NamedTemporaryFile(delete=False) as tf, \
         tempfile.NamedTemporaryFile(delete=False) as stf:
        shutil.copyfileobj(questions_file.file, qf)
        shutil.copyfileobj(topics_file.file, tf)
        shutil.copyfileobj(subtopics_file.file, stf)
        qf.flush(); tf.flush(); stf.flush()
        result = await load_data_to_db(
            session,
            questions_csv=qf.name,
            topics_csv=tf.name,
            subtopics_csv=stf.name,
            skip=skip,
            limit=limit
        )
    return {"imported": result}

@questions_router.delete("/all/", response_model=Dict[str, int])
async def delete_all_questions_endpoint(session: AsyncSession = Depends(get_session)):
    deleted_count = await delete_all_questions(session)
    return {"deleted": deleted_count}

@questions_router.delete("/bulk/", response_model=Dict[str, int])
async def delete_questions_bulk(
    question_ids: list[int] = Body(..., embed=True),
    session: AsyncSession = Depends(get_session)
):
    deleted_count = await delete_questions_and_related(session, question_ids)
    return {"deleted": deleted_count}

@questions_router.delete("/{question_id}/", response_model=Dict[str, bool])
async def delete_question(
    question_id: int,
    session: AsyncSession = Depends(get_session)
):
    success = await delete_question_and_related(session, question_id)
    return {"success": success} 