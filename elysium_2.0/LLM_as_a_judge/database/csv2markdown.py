from openai import OpenAI
import pandas as pd
import json
import os


api_key = os.getenv("OPEN_AI_KEY")
client = OpenAI(
    api_key=api_key,
)

system_prompt = """Твоя задача переписать текст один в один только в стиле markdown, чтоб его было удобно читать
Особенности:
1) Не в коем случае не меняй последовательность слов и сами слова. Ты меняешь только формат под markdown.
2) Не нужно писать заглавия.
3) Старайся компактно переписать текст, не меняя слова и их последовательность.
4) Для выделения текста или терминов используй формат: `текст`. Для кода используй такой формат: ```python код ```.

Пример: 
ДО:
Основные типы задач машинного обучения:
Обучение с учителем (Supervised Learning): модели обучаются на размеченных данных, где каждому входному примеру соответствует выходной ответ. К задачам относятся классификация и регрессия.
Обучение без учителя (Unsupervised Learning): модели обучаются на неразмеченных данных без предоставления выходной информации. К задачам относятся кластеризация, снижение размерности и ассоциативное обучение.
Полуобученное обучение (Semi-supervised Learning): использует как размеченные, так и неразмеченные данные для обучения модели.
Обучение с подкреплением (Reinforcement Learning): агент обучается взаимодействовать с окружающей средой, чтобы выполнить определенную задачу, максимизируя некоторую награду.

ПОСЛЕ:
**Основные типы задач машинного обучения:**
1. Обучение с учителем `(Supervised Learning)`: Модели обучаются на размеченных данных, где каждому входному примеру соответствует выходной ответ. К задачам относятся классификация и регрессия.
2. Обучение без учителя `(Unsupervised Learning)`: Модели обучаются на неразмеченных данных без предоставления выходной информации. К задачам относятся кластеризация, снижение размерности и ассоциативное обучение.
3. Полуобученное обучение `(Semi-supervised Learning)`: Использует как размеченные, так и неразмеченные данные для обучения модели.
4. Обучение с подкреплением `(Reinforcement Learning)`: Агент обучается взаимодействовать с окружающей средой, чтобы выполнить определенную задачу, максимизируя некоторую награду."""
user_prompt = """Ответ который нужно переписать в markdown: {answer}"""


def make_request(question, answer):
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": user_prompt.format(question=question, answer=answer),
            },
        ],
        model="gpt-4o-mini",
    )
    res = chat_completion.choices[0].message.content
    return res


df = pd.read_csv("database/questions.csv")
new_markdown_answer = []
for index, row in df.iterrows():
    print(index)
    question = row["question"]
    answer = row["answer"]
    result = make_request(question, answer)
    new_markdown_answer.append(result)


with open("database/new_markdown_answers.json", "w", encoding="utf-8") as f:
    json.dump(new_markdown_answer, f, ensure_ascii=False, indent=2)
df["new_markdown_answer"] = new_markdown_answer
df.to_csv("database/new_questions.csv", index=False)
