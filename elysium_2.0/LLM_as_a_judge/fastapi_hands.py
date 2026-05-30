from pydantic import BaseModel
from typing import Optional, List
from domain.input_output import (
    AssessmentResponse,
    HistoryInterviewMode,
    MessageInterviewMode,
    LLMOutputInterviewMode,
    OutputInterviewMode,
)


def load_prompt(filename):
    with open(f"prompts/{filename}", "r", encoding="utf-8") as f:
        return f.read().strip()


def make_structure_output(client, messages, outputModel):
    chat_completion = client.chat.completions.create(
        messages=messages,
        model="gpt-4o-mini",
        response_format={
            "type": "json_schema",
            "json_schema": {"name": "assessment_response", "schema": outputModel.model_json_schema()},
        },
    )
    res = chat_completion.choices[0].message.content
    assessment_data = outputModel.model_validate_json(res)
    return assessment_data


GET_CARD_ANSWER_PROMPT = load_prompt("get_card_answer.md")
INTERVIEW_MODE_MAKE_CONCLUSION = load_prompt("interview_mode_make_conclusion.md")
INTERVIEW_MODE_ADD_QUESTION = load_prompt("interview_mode_add_question.md")


async def get_answer(client, user_answer, real_answer):
    question = real_answer[0]
    answer = real_answer[1]
    system_prompt = load_prompt("get_answer.md")
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": system_prompt.format(question=question, answer=answer),
            },
            {
                "role": "user",
                "content": "Ответ user: " + user_answer,
            },
        ],
        model="gpt-4o-mini",
        response_format={
            "type": "json_schema",
            "json_schema": {"name": "assessment_response", "schema": AssessmentResponse.model_json_schema()},
        },
    )
    res = chat_completion.choices[0].message.content
    assessment_data = AssessmentResponse.model_validate_json(res)
    return assessment_data


def assessment_processing(result):
    lines = result.splitlines()
    main_text = "\n".join(line for line in lines if not line.startswith("Score:"))
    score = next((line.split(":")[1].strip() for line in lines if line.startswith("Score:")), None)
    return main_text, int(score)


async def get_card_answer(client, question, answer, resources, history, user_answer):
    system_prompt = GET_CARD_ANSWER_PROMPT
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": system_prompt.format(
                    question=question, answer=answer, resources=resources, history="\n".join(history)
                ),
            },
            {
                "role": "user",
                "content": user_answer,
            },
        ],
        model="gpt-4o-mini",
    )
    res = chat_completion.choices[0].message.content
    return res


async def interview_mode_answer(
    client, user_answer: Optional[str], real_answer: list, history: HistoryInterviewMode
) -> OutputInterviewMode:
    history_dict = []
    for message in history.history_list:
        if message.user_message:
            history_dict.append({"role": "user", "content": message.user_message})
        if message.assistent_message:
            history_dict.append({"role": "assistent", "content": message.assistent_message})
    history_str = "\n".join([f"{msg['role']}: {msg['content']}" for msg in history_dict])

    question = real_answer[0]
    answer = real_answer[1]
    if len(history.history_list) == 2:
        # оцениваем и заканчиваем диалог
        system_prompt = INTERVIEW_MODE_MAKE_CONCLUSION.format(question=question, answer=answer, history=history_str)
        messages = [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_answer}]
        response = make_structure_output(client, messages, AssessmentResponse)
        # Сохраняем AssessmentResponse в строку (например, сериализуем в JSON)
        response_str = (
            f"score: {response.score}\n"
            f"correct: {', '.join(response.correct)}\n"
            f"incorrect: {', '.join(response.incorrect)}\n"
            f"what_didnt_say: {', '.join(response.what_didnt_say)}"
        )
        history.history_list.append(MessageInterviewMode(assistent_message=response_str, user_message=user_answer))
        return OutputInterviewMode(next_question=None, feedback=response, is_complited=True, history_list=history)
    elif len(history.history_list) != 0:
        # смотрим на ошибки и бьем по ним
        system_prompt = INTERVIEW_MODE_ADD_QUESTION.format(question=question, answer=answer, history=history_str)
        messages = [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_answer}]
        response = make_structure_output(client, messages, LLMOutputInterviewMode)
        history.history_list.append(
            MessageInterviewMode(assistent_message=response.next_question, user_message=user_answer)
        )
        return OutputInterviewMode(
            next_question=response.next_question,
            feedback=None,
            is_complited=response.is_complited,
            history_list=history,
        )
    else:
        # когда у нас первый запрос
        history.history_list.append(MessageInterviewMode(assistent_message=question, user_message=None))
        return OutputInterviewMode(next_question=question, feedback=None, is_complited=False, history_list=history)
