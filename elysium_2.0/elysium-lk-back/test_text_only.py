#!/usr/bin/env python3
"""
Тест только для текстовых ответов
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_text_answer_only():
    """Тест отправки только текстового ответа"""
    print("🧪 Тестирование текстового ответа (без answer_volume)...")
    
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
        
        # Отправляем только текстовый ответ (без answer_volume)
        form_data = {
            'question_id': (None, str(question_id)),
            'answer_body': (None, 'Это тестовый текстовый ответ без аудио'),
            'is_anonymous': (None, 'True')
        }
        
        print("📤 Отправляем запрос без answer_volume...")
        response = requests.post(f"{BASE_URL}/user-answers/", files=form_data)
        
        print(f"📥 Получен ответ: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Текстовый ответ успешно отправлен!")
            print(f"   ID ответа: {result['id']}")
            print(f"   Текст: {result['answer_body']}")
            print(f"   Аудио: {result['answer_volume']}")
            return True
        else:
            print(f"❌ Ошибка: {response.status_code}")
            print(f"   Ответ: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Тест текстовых ответов...")
    test_text_answer_only() 