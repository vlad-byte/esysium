#!/usr/bin/env python3
"""
Быстрый тест для проверки исправлений API
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_text_answer():
    """Тест отправки текстового ответа"""
    print("🧪 Тестирование текстового ответа...")
    
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
        
        # Отправляем текстовый ответ
        form_data = {
            'question_id': (None, str(question_id)),
            'answer_body': (None, 'Тестовый ответ'),
            'is_anonymous': (None, 'True')
        }
        
        response = requests.post(f"{BASE_URL}/user-answers/", files=form_data)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Текстовый ответ успешно отправлен!")
            print(f"   ID ответа: {result['id']}")
            print(f"   Текст: {result['answer_body']}")
            return True
        else:
            print(f"❌ Ошибка: {response.status_code}")
            print(f"   Ответ: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Быстрый тест API...")
    test_text_answer() 