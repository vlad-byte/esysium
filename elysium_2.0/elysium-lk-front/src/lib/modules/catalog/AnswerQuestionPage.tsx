'use client'

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useNavigation } from "./hooks/useNavigation";
import { useAnswerMode } from "./hooks/useAnswerMode";
import BackButton from "./components/BackButton";
import AnswerInput from "./components/AnswerInput";
import { mock } from "./data/mock";
import FeedbackBlock from "./components/FeedbackBlock";
import Notification from "./components/Notification";
import { useGetQuestionByIdQuery } from "@/lib/services";
import { useGetUserAnswersByQuestionQuery } from "@/lib/services/userAnswersApi";

const MAX_TIME = 120; // секунд
const MAX_CHARS = 800;

const AnswerQuestionPage: React.FC = () => {
  const [tab, setTab] = useState<'feedback' | 'sample' | 'resources'>('feedback');
  const params = useParams();
  const categoryId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const questionId = Array.isArray(params?.question_id) ? params.question_id[0] : params?.question_id;

  const { data: questionData, isLoading, error } = useGetQuestionByIdQuery(Number(questionId)) 

  const { goToCategory } = useNavigation();
  const {
    answerMode,
    textAnswer,
    userAnswered,
    sentAnswer,
    isRecording,
    timeLeft,
    audioBlob,
    hasRecorded,
    isSubmitting,
    notification,
    switchToText,
    switchToVoice,
    updateTextAnswer,
    startRecording,
    stopRecording,
    submitAnswer,
    hideNotification,
    feedback, // <-- добавляем feedback
    resetAnswer, // <-- добавляем resetAnswer
  } = useAnswerMode();

  const { data: userAnswers, refetch } = useGetUserAnswersByQuestionQuery(Number(questionId), {
    skip: !questionId,
  });
  const lastUserAnswer = userAnswers && userAnswers.length > 0
    ? userAnswers[userAnswers.length - 1]
    : null;

  const feedbackToShow = userAnswered
    ? feedback
    : lastUserAnswer?.feedback || '';

  const sentAnswerToShow = userAnswered
    ? (sentAnswer?.trim() || lastUserAnswer?.answer_body?.trim() || 'Голосовой ответ')
    : lastUserAnswer?.answer_body || (lastUserAnswer?.answer_volume ? 'Голосовой ответ' : '');

  const handleSubmitAnswer = async () => {
    if (questionId) {
      await submitAnswer(Number(questionId));
      await refetch();
      setIsRepeatMode(false);
    } else {
      console.error('Question ID not found in URL');
    }
  };

  const [isRepeatMode, setIsRepeatMode] = useState(false);

  const handleRepeatAnswer = () => {
    resetAnswer();
    setTab('feedback');
    setIsRepeatMode(true);
  };

  // Обработка состояний загрузки и ошибок
  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#fdfcfa] px-2 py-10">
        <div className="text-2xl font-semibold text-gray-600">Загрузка вопроса...</div>
        <div className="mt-4 w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#fdfcfa] px-2 py-10">
        <div className="text-2xl font-semibold text-red-600 mb-4">Ошибка загрузки вопроса</div>
        <div className="text-gray-600 mb-4">Не удалось загрузить данные вопроса</div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-pink-500 transition"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (!questionData) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#fdfcfa] px-2 py-10">
        <div className="text-2xl font-semibold text-gray-600">Вопрос не найден</div>
      </div>
    );
  }

  // Определяем, есть ли уже ответ пользователя
  const hasUserAnswer = userAnswered || !!lastUserAnswer;

  // Определяем, показывать ли кнопки ответа
  const showAnswerButtons = !hasUserAnswer || isRepeatMode;

  // Для FeedbackBlock: если в режиме повторного ответа, показываем заглушку
  const feedbackBlockFeedback = isRepeatMode ? 'Обратная связь появится после ответа на вопрос' : (feedbackToShow || '');
  const feedbackBlockUserAnswered = isRepeatMode ? false : hasUserAnswer;
  const feedbackBlockSentAnswer = isRepeatMode ? '' : (sentAnswerToShow || '');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-2 sm:px-4 md:px-8 py-6 gap-4">
      <BackButton onClick={() => categoryId && goToCategory(Number(categoryId))} />
      
      {/* Уведомления */}
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
      
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-8">
        <div className="text-3xl sm:text-4xl font-extrabold text-center text-[#171717] mb-2">{questionData?.topicName || 'Вопрос без темы'}</div>
        <div className="text-lg sm:text-xl text-center text-gray-700 mb-6">{questionData.text}</div>
        {/* Кнопки ответа и инпуты только если можно отвечать */}
        {showAnswerButtons && (
          <AnswerInput
            answerMode={answerMode}
            textAnswer={textAnswer}
            isRecording={isRecording}
            timeLeft={timeLeft}
            audioBlob={audioBlob}
            hasRecorded={hasRecorded}
            switchToText={switchToText}
            switchToVoice={switchToVoice}
            updateTextAnswer={updateTextAnswer}
            startRecording={startRecording}
            stopRecording={stopRecording}
            userAnswered={userAnswered}
          />
        )}
        {answerMode === 'text' && showAnswerButtons && (
          <div className="text-2xl font-mono text-center text-gray-700 mb-4">Осталось символов: {MAX_CHARS - textAnswer.length}</div>
        )}
        {/* Кнопка отправки ответа */}
        {showAnswerButtons && (
          <button
            className={`mb-4 px-6 py-3 rounded-lg font-semibold text-base transition custom-cursor shadow ${
              (answerMode === 'text' ? !textAnswer.trim() : !audioBlob) || userAnswered || isSubmitting
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-violet-600 text-white hover:bg-pink-500 hover:shadow-lg'
            }`}
            disabled={(answerMode === 'text' ? !textAnswer.trim() : !audioBlob) || userAnswered || isSubmitting}
            onClick={handleSubmitAnswer}
          >
            {isSubmitting ? 'Отправка...' : 'Отправить ответ'}
          </button>
        )}
        <FeedbackBlock
          tab={tab}
          setTab={setTab}
          userAnswered={feedbackBlockUserAnswered}
          sentAnswer={feedbackBlockSentAnswer}
          feedback={feedbackBlockFeedback}
          sampleAnswer={questionData.sampleAnswer}
          resourse={questionData.resourse}
        />
        {/* Кнопка "Ответить повторно" */}
        {hasUserAnswer && !isRepeatMode && !isSubmitting && (
          <button
            className="mt-2 px-6 py-2 rounded-lg font-semibold text-base bg-violet-100 text-violet-700 hover:bg-violet-200 transition custom-cursor animate-pulse"
            onClick={handleRepeatAnswer}
            style={{ cursor: 'pointer' }}
          >
            Ответить повторно
          </button>
        )}
      </div>
    </div>
  );
};

export default AnswerQuestionPage; 