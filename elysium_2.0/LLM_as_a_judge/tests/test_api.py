import requests
import json
from typing import List


def test_get_interview_answer():
    """Тестирование эндпоинта get_interview_answer"""

    # URL эндпоинта
    url = "http://localhost:8000/get_interview_answer"

    # Тестовые данные
    test_data = {
        "user_answer": "Supervised Learning",
        "real_answer": [
            "Какие основные типы задач машинного обучения существуют?",
            "**Основные типы задач машинного обучения:**\n1. Обучение с учителем `(Supervised Learning)`: Модели обучаются на размеченных данных, где каждому входному примеру соответствует выходной ответ. К задачам относятся классификация и регрессия.\n2. Обучение без учителя `(Unsupervised Learning)`: Модели обучаются на неразмеченных данных без предоставления выходной информации. К задачам относятся кластеризация, снижение размерности и ассоциативное обучение.\n3. Полуобученное обучение `(Semi-supervised Learning)`: Использует как размеченные, так и неразмеченные данные для обучения модели.\n4. Обучение с подкреплением `(Reinforcement Learning)`: Агент обучается взаимодействовать с окружающей средой, чтобы выполнить определенную задачу, максимизируя некоторую награду.",
        ],
        "history": {
            "history_list": [
                {"user_message": None, "assistent_message": "Какие основные типы задач машинного обучения существуют?"}
            ]
        },
    }

    try:
        # Отправляем POST запрос
        response = requests.post(url, json=test_data)

        print(f"Статус ответа: {response.status_code}")
        print(f"Заголовки ответа: {dict(response.headers)}")

        if response.status_code == 200:
            result = response.json()
            print("✅ Успешный ответ:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
        else:
            print(f"❌ Ошибка: {response.status_code}")
            print(f"Текст ошибки: {response.text}")

    except requests.exceptions.ConnectionError:
        print("❌ Не удалось подключиться к серверу. Убедитесь, что FastAPI сервер запущен на localhost:8000")
    except Exception as e:
        print(f"❌ Произошла ошибка: {e}")


def test_empty_answer():
    """Тест с пустым ответом пользователя"""

    url = "http://localhost:8000/get_interview_answer"

    test_data = {
        "user_answer": "",
        "real_answer": [
            "Какие основные типы задач машинного обучения существуют?",
            "**Основные типы задач машинного обучения:**\n1. Обучение с учителем `(Supervised Learning)`: Модели обучаются на размеченных данных, где каждому входному примеру соответствует выходной ответ. К задачам относятся классификация и регрессия.\n2. Обучение без учителя `(Unsupervised Learning)`: Модели обучаются на неразмеченных данных без предоставления выходной информации. К задачам относятся кластеризация, снижение размерности и ассоциативное обучение.\n3. Полуобученное обучение `(Semi-supervised Learning)`: Использует как размеченные, так и неразмеченные данные для обучения модели.\n4. Обучение с подкреплением `(Reinforcement Learning)`: Агент обучается взаимодействовать с окружающей средой, чтобы выполнить определенную задачу, максимизируя некоторую награду.",
        ],
        "history": {"history_list": []},
    }

    try:
        response = requests.post(url, json=test_data)

        print(f"\n📝 Тест с пустым ответом:")
        print(f"Статус ответа: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print("✅ Успешный ответ:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
        else:
            print(f"❌ Ошибка: {response.status_code}")
            print(f"Текст ошибки: {response.text}")

    except requests.exceptions.ConnectionError:
        print("❌ Не удалось подключиться к серверу")
    except Exception as e:
        print(f"❌ Произошла ошибка: {e}")


if __name__ == "__main__":
    print("🚀 Тестирование эндпоинта get_interview_answer")
    print("=" * 50)

    test_get_interview_answer()
    test_empty_answer()
