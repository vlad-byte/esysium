import React from "react";

const MAX_CHARS = 800;

export interface AnswerInputProps {
  answerMode: 'voice' | 'text';
  textAnswer: string;
  isRecording: boolean;
  timeLeft: number;
  audioBlob: Blob | null;
  hasRecorded: boolean;
  switchToText: () => void;
  switchToVoice: () => void;
  updateTextAnswer: (v: string) => void;
  startRecording: () => void;
  stopRecording: () => void;
  userAnswered: boolean;
}

const AnswerInput: React.FC<AnswerInputProps> = ({
  answerMode,
  textAnswer,
  isRecording,
  timeLeft,
  audioBlob,
  hasRecorded,
  switchToText,
  switchToVoice,
  updateTextAnswer,
  startRecording,
  stopRecording,
  userAnswered,
}) => {
  // Отладочная информация
  React.useEffect(() => {
    console.log('AnswerInput: timeLeft changed to:', timeLeft);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVoiceButtonClick = () => {
    if (userAnswered) return;
    
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 mb-2 w-full">
      {answerMode === 'voice' ? (
        <>
          <button
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition cursor-pointer custom-cursor ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : audioBlob 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-pink-500 hover:bg-pink-600'
            }`}
            style={{ outline: 'none', border: 'none' }}
            disabled={userAnswered}
            onClick={handleVoiceButtonClick}
          >
            {isRecording ? (
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="white">
                <rect x="6" y="6" width="12" height="12" strokeWidth={2} />
              </svg>
            ) : audioBlob ? (
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18v2m0 0c-3.314 0-6-2.686-6-6v-2a6 6 0 1112 0v2c0 3.314-2.686 6-6 6z" />
                <circle cx="12" cy="10" r="4" fill="#fff" stroke="none" />
              </svg>
            )}
          </button>
          
          <div className="text-sm text-gray-500 text-center">
            {isRecording 
              ? `Запись... ${formatTime(timeLeft)}`
              : audioBlob 
                ? 'Запись завершена. Нажмите для новой записи'
                : 'Нажмите на микрофон для записи ответа...'
            }
          </div>
          
          {audioBlob && !isRecording && (
            <div className="text-xs text-green-600 font-medium">
              ✓ Аудио готово к отправке
            </div>
          )}
          
          {!isRecording && !hasRecorded && (
            <button
              className="mt-2 text-gray-500 underline underline-offset-2 hover:text-pink-500 focus:text-violet-600 transition-colors custom-cursor"
              onClick={switchToText}
              disabled={userAnswered}
            >
              ответить текстом
            </button>
          )}
        </>
      ) : (
        <>
          <textarea
            className="w-full max-w-2xl min-h-[120px] rounded-xl border-2 border-gray-200 p-4 text-base focus:outline-none focus:ring-2 focus:ring-pink-300 transition bg-gray-50 text-gray-900 shadow-sm resize-y placeholder-gray-400"
            placeholder="Введите ваш ответ..."
            maxLength={MAX_CHARS}
            value={textAnswer}
            onChange={e => updateTextAnswer(e.target.value)}
            disabled={userAnswered}
          />
          <button
            className="mt-2 text-gray-500 underline underline-offset-2 hover:text-pink-500 focus:text-violet-600 transition-colors custom-cursor"
            onClick={switchToVoice}
            disabled={userAnswered}
          >
            ответить голосом
          </button>
        </>
      )}
    </div>
  );
};

export default AnswerInput; 