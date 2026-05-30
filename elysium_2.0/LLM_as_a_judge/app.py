import os
import io
import time
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException

load_dotenv()
from fastapi_hands import get_answer, get_card_answer, interview_mode_answer
from domain.input_output import (
    AnswerRequest,
    CardAnswerRequest,
    AnswerResponse,
    CardAnswerResponse,
    InterviewAnswerRequest,
    OutputInterviewMode,
)
from openai import OpenAI


api_key = os.getenv("OPEN_AI_KEY")
client = OpenAI(
    api_key=api_key,
)
app = FastAPI(title="ML Interview API", description="API для интервью по машинному обучению")

logger = logging.getLogger("ml_api")
if not logger.handlers:
    logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))


@app.get("/")
async def root():
    """Корневая ручка для проверки работы API"""
    return {"message": "ML Interview API работает!"}

@app.post("/transcribe")
async def transcribe_endpoint(file: UploadFile = File(...)):
    """
    Транскрибация аудио в текст через OpenAI.
    Логи: размер файла, длительность, длина результата, ошибки.
    """
    started = time.time()
    try:
        data = await file.read()
        logger.info(
            "transcribe:start filename=%s content_type=%s bytes=%s",
            file.filename,
            file.content_type,
            len(data),
        )

        if not data:
            raise HTTPException(status_code=400, detail="Empty file")

        # OpenAI SDK expects a file-like object with a name
        audio = io.BytesIO(data)
        audio.name = file.filename or "audio.wav"

        res = client.audio.transcriptions.create(
            model=os.getenv("TRANSCRIBE_MODEL", "whisper-1"),
            file=audio,
        )
        text = (getattr(res, "text", None) or "").strip()
        logger.info(
            "transcribe:done ms=%s text_len=%s",
            int((time.time() - started) * 1000),
            len(text),
        )
        return {"text": text}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("transcribe:error ms=%s err=%s", int((time.time() - started) * 1000), str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/get_answer", response_model=AnswerResponse)
async def get_answer_endpoint(request: AnswerRequest):
    logger.info("get_answer:start user_answer_len=%s", len(request.user_answer or ""))
    assessment_data = await get_answer(client, request.user_answer, request.real_answer)
    logger.info("get_answer:done score=%s", getattr(assessment_data, "score", None))
    return AnswerResponse(
        correct=assessment_data.correct,
        incorrect=assessment_data.incorrect,
        what_didnt_say=assessment_data.what_didnt_say,
        score=assessment_data.score,
    )


@app.post("/get_card_answer", response_model=CardAnswerResponse)
async def get_card_answer_endpoint(request: CardAnswerRequest):
    response = await get_card_answer(
        client, request.question, request.answer, request.resources, request.history, request.user_answer
    )
    return CardAnswerResponse(response=response)


@app.post("/get_interview_answer", response_model=OutputInterviewMode)
async def get_interview_answer_endpoint(request: InterviewAnswerRequest):
    response = await interview_mode_answer(client, request.user_answer, request.real_answer, request.history)
    return response


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
