# Elysium — локальный запуск

**Стек:** `elysium-lk-front` (Next.js) · `elysium-lk-back` (FastAPI) · `LLM_as_a_judge` (AI)

**Порты:** front `3000` · back `8000` · ai `8001`

**Нужно:** Python 3.11+, Node 20+, PostgreSQL (или удалённая БД из дефолта в `config.py`)

---

## 1. AI (`LLM_as_a_judge`)

```bash
cd LLM_as_a_judge
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8001
```

## 2. Back (`elysium-lk-back`)

```bash
cd elysium-lk-back
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
```

`.env` (опционально):

```env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/elyzium_db
AI_BACKEND_URL=http://localhost:8001
```

```bash
alembic upgrade head
uvicorn src.main:app --reload --port 8002
```

## 3. Front (`elysium-lk-front`)

```bash
cd elysium-lk-front
yarn install
# если back не на 8002: echo "NEXT_PUBLIC_API_URL=http://localhost:ПОРТ/api" > .env.local
yarn dev
```

---

**Проверка:** http://localhost:3000 · API http://localhost:8000/api/docs · AI http://localhost:8001

Запускайте все три сервиса одновременно (3 терминала).

Создать локальную бд

```
docker run -d --name elysium-pg \
  -e POSTGRES_USER=elyzium \
  -e POSTGRES_PASSWORD=elyzium \
  -e POSTGRES_DB=elyzium_db \
  -p 5432:5432 \
  postgres:16
```

Импорт через API: POST /api/questions/import_csv/ — 3 файла:

topics — колонки topic_id, Name → категории
subtopics — topic_id, subtopic_id, Name → темы
questions — question, type_interview, subtopic_id, new_markdown_answer