#!/usr/bin/env python3
"""
Отладочный тест для проверки заголовков запросов
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_headers():
    """Тест для проверки заголовков"""
    print("🧪 Тестирование заголовков запросов...")
    
    try:
        # Получаем ID вопроса
        response = requests.get(f"{BASE_URL}/questions/")
        if response.status_code != 200:
            print(f"❌ Ошибка получения вопросов: {response.status_code}")
            return False
            
        questions = response.json()
        if not questions:
            print("❌ Нет вопросов для тестирования")
            return False
            
        question_id = questions[0]['id']
        
        # Отправляем текстовый ответ и проверяем заголовки
        form_data = {
            'question_id': (None, str(question_id)),
            'answer_body': (None, 'Тестовый ответ'),
            'is_anonymous': (None, 'True')
        }
        
        # Создаем сессию для отладки
        session = requests.Session()
        
        # Добавляем обработчик для логирования запросов
        def log_request(request):
            print(f"📤 Отправляем запрос:")
            print(f"   URL: {request.url}")
            print(f"   Method: {request.method}")
            print(f"   Headers: {dict(request.headers)}")
            if hasattr(request, 'body') and request.body:
                print(f"   Body type: {type(request.body)}")
                if hasattr(request.body, 'read'):
                    print(f"   Body: FormData")
                else:
                    print(f"   Body: {request.body[:200]}...")
        
        # Отправляем запрос
        response = session.post(f"{BASE_URL}/user-answers/", files=form_data)
        
        print(f"📥 Получен ответ:")
        print(f"   Status: {response.status_code}")
        print(f"   Headers: {dict(response.headers)}")
        print(f"   Content: {response.text[:200]}...")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Запрос успешен!")
            print(f"   ID ответа: {result['id']}")
            return True
        else:
            print(f"❌ Ошибка: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Отладочный тест заголовков...")
    test_headers() 