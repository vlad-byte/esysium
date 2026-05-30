#!/usr/bin/env python3
"""
Тест работы без передачи completeness
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_without_completeness():
    """Тест отправки ответа без передачи completeness"""
    print("🧪 Тестирование отправки ответа без completeness...")
    
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
        print(f"✅ Используем вопрос ID: {question_id}")
        
        # Отправляем ответ без completeness
        form_data = {
            'question_id': (None, str(question_id)),
            'answer_body': (None, 'Тестовый ответ без completeness'),
            'is_anonymous': (None, 'True')
        }
        
        print("📤 Отправляем запрос без completeness...")
        response = requests.post(f"{BASE_URL}/user-answers/", files=form_data)
        
        print(f"📥 Получен ответ: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Ответ успешно отправлен!")
            print(f"   ID ответа: {result['id']}")
            print(f"   Текст: {result['answer_body']}")
            print(f"   Completeness (автоматически): {result['completeness']}")
            return True
        else:
            print(f"❌ Ошибка: {response.status_code}")
            print(f"   Ответ: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Тест без completeness...")
    test_without_completeness() 