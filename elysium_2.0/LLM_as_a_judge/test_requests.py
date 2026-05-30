import requests

# Базовый URL вашего API
BASE_URL = "http://localhost:8000"


def test_root():
    print("=== Тестирование корневой ручки ===")
    response = requests.get(f"{BASE_URL}/")
    print(f"Статус: {response.status_code}")
    print(f"Ответ: {response.json()}")
    print()


def test_get_answer():
    test_data = {
        "user_answer": "Линейная регрессия - это алгоритм машинного обучения для предсказания непрерывных значений. Она строит линейную зависимость между входными признаками и целевой переменной.",
        "real_answer": [
            "Что такое линейная регрессия?",
            "Линейная регрессия - это статистический метод для моделирования отношений между зависимой переменной и одной или несколькими независимыми переменными с помощью линейной функции. Основная идея заключается в нахождении наилучшей прямой линии, которая минимизирует сумму квадратов отклонений между наблюдаемыми и предсказанными значениями.",
        ],
    }
    try:
        response = requests.post(f"{BASE_URL}/get_answer", json=test_data, headers={"Content-Type": "application/json"})
        print(f"Статус: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Оценка: {result['score']}")
            print(f"Правильно: {result['correct']}")
            print(f"Неправильно: {result['incorrect']}")
            print(f"Что не сказано: {result['what_didnt_say']}")
        else:
            print(f"Ошибка: {response.text}")
    except Exception as e:
        print(f"Ошибка запроса: {e}")
    print()


def test_get_card_answer():
    test_data = {
        "question": "Что такое переобучение в машинном обучении?",
        "answer": "Переобучение (overfitting) - это явление, когда модель слишком хорошо запоминает обучающие данные, включая шум и случайные флуктуации, что приводит к плохому обобщению на новых данных.",
        "resources": "Дополнительные материалы: регуляризация (L1, L2), кросс-валидация, early stopping, dropout для нейронных сетей.",
        "history": [
            "Пользователь: Привет, можешь объяснить основы ML?",
            "Ассистент: Конечно! Машинное обучение - это область ИИ, где алгоритмы учатся на данных.",
        ],
        "user_answer": "Можешь привести практический пример переобучения?",
    }
    try:
        response = requests.post(
            f"{BASE_URL}/get_card_answer", json=test_data, headers={"Content-Type": "application/json"}
        )
        print(f"Статус: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Ответ: {result['response']}")
        else:
            print(f"Ошибка: {response.text}")
    except Exception as e:
        print(f"Ошибка запроса: {e}")
    print()


def main():
    print("Запуск тестов для ML Interview API")
    print("=" * 50)
    try:
        requests.get(f"{BASE_URL}/", timeout=5)
        print("✅ API доступен")
    except requests.exceptions.RequestException:
        print("❌ API недоступен. Убедитесь, что сервер запущен на localhost:8000")
        return
    print()
    # Запускаем тесты
    test_root()
    test_get_answer()
    test_get_card_answer()
    print("Тестирование завершено!")


if __name__ == "__main__":
    main()
