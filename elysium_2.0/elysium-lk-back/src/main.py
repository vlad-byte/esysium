from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from src.api.routes import all_routers
from dotenv import load_dotenv
load_dotenv()

# Получаем базовый путь из переменных окружения
BASE_PATH = os.getenv("BASE_PATH", "/api")

app = FastAPI(
    root_path=BASE_PATH,  # Критически важный параметр!
    docs_url="/docs",     # Теперь будет доступен по /api/docs
    redoc_url="/redoc",   # /api/redoc
    openapi_url="/openapi.json"  # /api/openapi.json
)

# Обновим CORS для работы с фронтендом
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        frontend_url,
        "http://localhost:3000",
        ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in all_routers:
    app.include_router(router)
