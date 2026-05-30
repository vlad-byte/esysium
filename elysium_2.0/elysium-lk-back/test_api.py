#!/usr/bin/env python3
"""
Простой тестовый скрипт для проверки API интеграции
"""

import requests
import json
import base64

# Базовый URL API
BASE_URL = "http://localhost:8000"

def test_get_question_with_topic():
    """Тест получения вопроса с информацией о теме"""
    print("🧪 Тестирование получения вопроса с темой...")
    
    try:
        # Получаем список всех вопросов
        response = requests.get(f"{BASE_URL}/questions/")
        if response.status_code == 200:
            questions = response.json()
            if questions:
                # Берем первый вопрос для теста
                question_id = questions[0]['id']
                print(f"✅ Получен список вопросов, тестируем вопрос ID: {question_id}")
                
                # Получаем конкретный вопрос
                response = requests.get(f"{BASE_URL}/questions/{question_id}")
                if response.status_code == 200:
                    question = response.json()
                    print(f"✅ Вопрос получен успешно!")
                    print(f"   ID: {question['id']}")
                    print(f"   Название: {question['name']}")
                    print(f"   Тема: {question['topic_name']}")
                    print(f"   Этап: {question['stage']}")
                    if question.get('sample_answer'):
                        print(f"   Пример ответа: {question['sample_answer']['description'][:50]}...")
                    return True
                else:
                    print(f"❌ Ошибка получения вопроса: {response.status_code}")
                    print(f"   Ответ: {response.text}")
            else:
                print("❌ Список вопросов пуст")
        else:
            print(f"❌ Ошибка получения списка вопросов: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Не удается подключиться к серверу. Убедитесь, что сервер запущен на http://localhost:8000")
    except Exception as e:
        print(f"❌ Ошибка: {e}")
    
    return False

def test_create_text_answer():
    """Тест создания текстового ответа"""
    print("\n🧪 Тестирование создания текстового ответа...")
    
    try:
        # Сначала получаем ID вопроса
        response = requests.get(f"{BASE_URL}/questions/")
        if response.status_code == 200:
            questions = response.json()
            if questions:
                question_id = questions[0]['id']
                
                # Создаем текстовый ответ в формате multipart/form-data
                answer_data = {
                    "question_id": (None, str(question_id)),
                    "answer_body": (None, "Это тестовый текстовый ответ для проверки API"),
                    "is_anonymous": (None, "True")
                }
                
                response = requests.post(f"{BASE_URL}/user-answers/", files=answer_data)
                if response.status_code == 200:
                    answer = response.json()
                    print(f"✅ Текстовый ответ создан успешно!")
                    print(f"   ID ответа: {answer['id']}")
                    print(f"   Вопрос ID: {answer['question_id']}")
                    print(f"   Текст: {answer['answer_body']}")
                    return True
                else:
                    print(f"❌ Ошибка создания текстового ответа: {response.status_code}")
                    print(f"   Ответ: {response.text}")
            else:
                print("❌ Нет вопросов для тестирования")
        else:
            print(f"❌ Ошибка получения вопросов: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Ошибка: {e}")
    
    return False

def test_create_voice_answer():
    """Тест создания голосового ответа"""
    print("\n🧪 Тестирование создания голосового ответа...")
    
    try:
        # Сначала получаем ID вопроса
        response = requests.get(f"{BASE_URL}/questions/")
        if response.status_code == 200:
            questions = response.json()
            if questions:
                question_id = questions[0]['id']
                
                # Создаем тестовый аудио файл
                test_audio_content = b"test audio data"
                
                # Создаем голосовой ответ в формате multipart/form-data
                answer_data = {
                    "question_id": (None, str(question_id)),
                    "answer_body": (None, ""),
                    "answer_volume": ("test_audio.wav", test_audio_content, "audio/wav"),
                    "is_anonymous": (None, "True"),
                    "completeness": (None, "Полный ответ")
                }
                
                response = requests.post(f"{BASE_URL}/user-answers/", files=answer_data)
                if response.status_code == 200:
                    answer = response.json()
                    print(f"✅ Голосовой ответ создан успешно!")
                    print(f"   ID ответа: {answer['id']}")
                    print(f"   Вопрос ID: {answer['question_id']}")
                    print(f"   Аудио данные: {len(answer['answer_volume'])} символов")
                    return True
                else:
                    print(f"❌ Ошибка создания голосового ответа: {response.status_code}")
                    print(f"   Ответ: {response.text}")
            else:
                print("❌ Нет вопросов для тестирования")
        else:
            print(f"❌ Ошибка получения вопросов: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Ошибка: {e}")
    
    return False

def main():
    """Основная функция тестирования"""
    print("🚀 Запуск тестов API интеграции...")
    print("=" * 50)
    
    tests_passed = 0
    total_tests = 3
    
    # Тест 1: Получение вопроса с темой
    if test_get_question_with_topic():
        tests_passed += 1
    
    # Тест 2: Создание текстового ответа
    if test_create_text_answer():
        tests_passed += 1
    
    # Тест 3: Создание голосового ответа
    if test_create_voice_answer():
        tests_passed += 1
    
    print("\n" + "=" * 50)
    print(f"📊 Результаты тестирования: {tests_passed}/{total_tests} тестов пройдено")
    
    if tests_passed == total_tests:
        print("🎉 Все тесты пройдены успешно! Интеграция работает корректно.")
    else:
        print("⚠️  Некоторые тесты не пройдены. Проверьте настройки API.")

if __name__ == "__main__":
    main() 