from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from src.shemas.user_answers import UserAnswer, UserAnswerCreate, UserAnswerUpdate, TopicProgress, CategoryProgress
from src.database.user_answers import (
    get_user_answers, 
    get_user_answers_by_question, 
    create_user_answer, 
    update_user_answer, 
    delete_user_answer,
    calculate_topic_progress,
    calculate_category_progress
)
from src.database.db import get_session
from src.database.models import CompletenessEnum, SampleAnswer, Question
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import base64
import httpx
import json
from sqlalchemy import select
import os

user_answers_router = APIRouter(prefix="/user-answers", tags=["User Answers"])


def _normalize_feedback_list(value) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    text = str(value).strip()
    return [text] if text else []


def _build_feedback_json(feedback_data: dict) -> str:
    payload = {
        "score": feedback_data.get("score"),
        "correct": _normalize_feedback_list(feedback_data.get("correct")),
        "incorrect": _normalize_feedback_list(feedback_data.get("incorrect")),
        "what_didnt_say": _normalize_feedback_list(feedback_data.get("what_didnt_say")),
    }
    return json.dumps(payload, ensure_ascii=False)

@user_answers_router.get("/", response_model=List[UserAnswer])
async def get_all_user_answers(session: AsyncSession = Depends(get_session)):
    """Получить все ответы пользователей"""
    try:
        return await get_user_answers(session)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@user_answers_router.get("/question/{question_id}/", response_model=List[UserAnswer])
async def get_user_answers_for_question(question_id: int, session: AsyncSession = Depends(get_session)):
    """Получить все ответы пользователей на конкретный вопрос"""
    try:
        return await get_user_answers_by_question(session, question_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@user_answers_router.get("/topic/{topic_id}/progress", response_model=TopicProgress)
async def get_topic_progress(
    topic_id: int, 
    user_id: Optional[int] = Query(None, description="ID пользователя. Если не указан, используются анонимные ответы"),
    session: AsyncSession = Depends(get_session)
):
    """Рассчитать прогресс пользователя по теме"""
    try:
        return await calculate_topic_progress(session, topic_id, user_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@user_answers_router.get("/category/{category_id}/progress", response_model=CategoryProgress)
async def get_category_progress(
    category_id: int, 
    user_id: Optional[int] = Query(None, description="ID пользователя. Если не указан, используются анонимные ответы"),
    session: AsyncSession = Depends(get_session)
):
    """Рассчитать прогресс пользователя по категории с учетом сложности тем"""
    try:
        return await calculate_category_progress(session, category_id, user_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@user_answers_router.post("/", response_model=UserAnswer)
async def create_new_user_answer(
    question_id: int = Form(...),
    answer_body: str = Form(...),
    answer_volume: Optional[UploadFile] = File(None),
    is_anonymous: bool = Form(True),
    user_id: Optional[int] = Form(None),
    session: AsyncSession = Depends(get_session)
):
    """Создать новый ответ пользователя с поддержкой загрузки файлов"""
    try:
        # Обрабатываем аудио файл
        answer_volume_str = ""
        audio_bytes: bytes | None = None
        audio_filename: str | None = None
        audio_content_type: str | None = None
        if answer_volume:
            # Читаем содержимое файла и кодируем в base64
            file_content = await answer_volume.read()
            audio_bytes = file_content
            audio_filename = answer_volume.filename
            audio_content_type = answer_volume.content_type
            answer_volume_str = base64.b64encode(file_content).decode('utf-8')

        feedback = None
        # Если это голосовой ответ (текста нет) — сначала транскрибируем аудио через AI сервис
        if (not answer_body) and audio_bytes:
            async with httpx.AsyncClient() as client:
                ai_backend_url = os.environ.get("AI_BACKEND_URL", "http://localhost:8001")
                tr_resp = await client.post(
                    f"{ai_backend_url}/transcribe",
                    files={
                        "file": (
                            audio_filename or "audio.wav",
                            audio_bytes,
                            audio_content_type or "application/octet-stream",
                        )
                    },
                    timeout=60,
                )
                if tr_resp.status_code == 200:
                    answer_body = (tr_resp.json().get("text") or "").strip()
                else:
                    feedback = "Не удалось транскрибировать аудио"

        # Если есть текстовый ответ (в т.ч. после транскрибации), отправляем на llm_back
        if answer_body:
            # Получаем эталонный ответ (sample_answer) и сам вопрос для question_id
            sample_answer = await session.execute(
                select(SampleAnswer).where(SampleAnswer.question_id == question_id)
            )
            sample_answer_obj = sample_answer.scalar_one_or_none()
            real_answer_text = sample_answer_obj.description if sample_answer_obj else ""
            question_obj = await session.get(Question, question_id)
            question_text = question_obj.name if question_obj else ""
            # Отправляем запрос на llm_back
            async with httpx.AsyncClient() as client:
                ai_backend_url = os.environ.get("AI_BACKEND_URL", "http://localhost:8001")
                llm_resp = await client.post(
                    f"{ai_backend_url}/get_answer",
                    json={
                        "user_answer": answer_body,
                        "real_answer": [question_text, real_answer_text]
                    },
                    timeout=30
                )
                if llm_resp.status_code == 200:
                    feedback_data = llm_resp.json()
                    feedback = _build_feedback_json(feedback_data)
                else:
                    feedback = "Не удалось получить фидбек от нейросети"

         # TODO: Здесь будет логика анализа ответа для определения completeness
        # Пока устанавливаем значение по умолчанию
        completeness_enum = CompletenessEnum.complete

        # Создаем объект UserAnswerCreate
        answer_data = UserAnswerCreate(
            question_id=question_id,
            answer_body=answer_body,
            answer_volume=answer_volume_str,
            is_anonymous=is_anonymous,
            user_id=user_id,
            completeness=completeness_enum,
            feedback=feedback
        )
        return await create_user_answer(session, answer_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@user_answers_router.put("/{answer_id}", response_model=UserAnswer)
async def update_existing_user_answer(answer_id: int, answer_data: UserAnswerUpdate, session: AsyncSession = Depends(get_session)):
    """Обновить существующий ответ пользователя"""
    try:
        return await update_user_answer(session, answer_id, answer_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@user_answers_router.delete("/{answer_id}")
async def delete_existing_user_answer(answer_id: int, session: AsyncSession = Depends(get_session)):
    """Удалить ответ пользователя"""
    try:
        return await delete_user_answer(session, answer_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 