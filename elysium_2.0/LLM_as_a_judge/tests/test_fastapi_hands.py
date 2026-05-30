import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import asyncio
from openai import OpenAI
from fastapi_hands import interview_mode_answer
from domain.input_output import HistoryInterviewMode, MessageInterviewMode


api_key = os.getenv("OPEN_AI_KEY")
client = OpenAI(
    api_key=api_key,
)


async def test_interview_mode_answer():
    user_answer = ""
    real_answer = [
        "Какие основные типы задач машинного обучения существуют?",
        "**Основные типы задач машинного обучения:**\n1. Обучение с учителем `(Supervised Learning)`: Модели обучаются на размеченных данных, где каждому входному примеру соответствует выходной ответ. К задачам относятся классификация и регрессия.\n2. Обучение без учителя `(Unsupervised Learning)`: Модели обучаются на неразмеченных данных без предоставления выходной информации. К задачам относятся кластеризация, снижение размерности и ассоциативное обучение.\n3. Полуобученное обучение `(Semi-supervised Learning)`: Использует как размеченные, так и неразмеченные данные для обучения модели.\n4. Обучение с подкреплением `(Reinforcement Learning)`: Агент обучается взаимодействовать с окружающей средой, чтобы выполнить определенную задачу, максимизируя некоторую награду.",
    ]
    history = HistoryInterviewMode()
    result = await interview_mode_answer(client, user_answer, real_answer, history)
    print("Тест 1:", result)

    user_answer = "Supervised Learning"
    history = HistoryInterviewMode(
        history_list=[
            MessageInterviewMode(
                user_message=None, assistent_message="Какие основные типы задач машинного обучения существуют?"
            )
        ]
    )
    result = await interview_mode_answer(client, user_answer, real_answer, history)
    print("Тест 2:", result)

    user_answer = (
        "Да Unsupervised Learning - это тип машинного обучения, при котором модель обучается на неразмеченных данных"
    )
    history = HistoryInterviewMode(
        history_list=[
            MessageInterviewMode(
                user_message=None, assistent_message="Какие основные типы задач машинного обучения существуют?"
            ),
            MessageInterviewMode(
                user_message="Supervised Learning",
                assistent_message="Можешь рассказать о других типах задач машинного обучения, таких как Unsupervised Learning и Reinforcement Learning?",
            ),
        ]
    )
    result = await interview_mode_answer(client, user_answer, real_answer, history)
    print("Тест 3:", result)


if __name__ == "__main__":
    asyncio.run(test_interview_mode_answer())
