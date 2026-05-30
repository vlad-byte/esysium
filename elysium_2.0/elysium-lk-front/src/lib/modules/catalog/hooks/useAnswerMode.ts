import { useState, useRef, useCallback, useEffect } from 'react';
import { useCreateTextAnswerMutation, useCreateVoiceAnswerMutation } from '../../../services/userAnswersApi';
import { useAuth } from '@/lib/components/AuthClientProvider';

export type AnswerMode = 'voice' | 'text';

export const useAnswerMode = () => {
  const [answerMode, setAnswerMode] = useState<AnswerMode>('voice');
  const [textAnswer, setTextAnswer] = useState('');
  const [userAnswered, setUserAnswered] = useState(false);
  const [sentAnswer, setSentAnswer] = useState<string | null>(null);
  
  // Состояние записи голоса
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 минуты в секундах
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [hasRecorded, setHasRecorded] = useState(false); // Флаг для отслеживания записи
  
  // Состояние уведомлений
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'info',
    isVisible: false
  });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeLeftRef = useRef<number>(120); // Добавляем ref для timeLeft
  const [feedback, setFeedback] = useState<string | null>(null);
  const { userId, isAuthenticated } = useAuth();

  // RTK Query мутации из нового API
  const [createTextAnswer, { isLoading: isSubmittingText }] = useCreateTextAnswerMutation();
  const [createVoiceAnswer, { isLoading: isSubmittingVoice }] = useCreateVoiceAnswerMutation();

  const switchToText = () => {
    console.log('switchToText called, isRecording:', isRecording);
    if (isRecording) {
      stopRecording();
    }
    setAnswerMode('text');
    setHasRecorded(false);
  };
  
  const switchToVoice = () => {
    setAnswerMode('voice');
    setAudioBlob(null);
    setTimeLeft(120);
    timeLeftRef.current = 120; // Сбрасываем ref
    setHasRecorded(false);
  };

  const updateTextAnswer = (value: string) => setTextAnswer(value);

  // Функция для остановки записи (без зависимостей)
  const stopRecordingInternal = useCallback(() => {
    console.log('stopRecordingInternal called');
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      console.log('Stopping MediaRecorder');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        console.log('Timer cleared');
      }
    } else {
      console.log('MediaRecorder not recording or not exists');
    }
  }, []);

  // Функция для начала записи
  const startRecording = useCallback(async () => {
    console.log('startRecording called');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Got media stream');
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        console.log('MediaRecorder stopped');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setHasRecorded(true);
        
        // Останавливаем все треки потока
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      console.log('MediaRecorder started');
      setIsRecording(true);
      setTimeLeft(120);
      timeLeftRef.current = 120; // Обновляем ref
      console.log('Recording started, timer set to 120');
      
      // Запускаем таймер
      console.log('Setting up timer interval');
      timerRef.current = setInterval(() => {
        console.log('Timer tick, current timeLeftRef:', timeLeftRef.current);
        timeLeftRef.current = timeLeftRef.current - 1;
        setTimeLeft(timeLeftRef.current);
        console.log('Timer tick, new timeLeft:', timeLeftRef.current);
        
        if (timeLeftRef.current <= 0) {
          console.log('Timer finished, stopping recording');
          // Останавливаем запись при достижении 0
          if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
          }
        }
      }, 1000);
      console.log('Timer interval set up, timerRef.current:', timerRef.current);
      
    } catch (error) {
      console.error('Ошибка при получении доступа к микрофону:', error);
      alert('Не удалось получить доступ к микрофону');
    }
  }, []);

  // Функция для остановки записи (публичная)
  const stopRecording = useCallback(() => {
    console.log('stopRecording called, isRecording:', isRecording);
    console.log('stopRecording stack trace:', new Error().stack);
    stopRecordingInternal();
  }, [stopRecordingInternal]);

  // Функция для подготовки аудио файла к отправке
  const prepareAudioForSubmission = useCallback(async (): Promise<File | null> => {
    if (!audioBlob) return null;
    
    try {
      // Конвертируем webm в wav
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Создаем WAV файл
      const wavBlob = audioBufferToWav(audioBuffer);
      const wavFile = new File([wavBlob], 'recording.wav', { type: 'audio/wav' });
      
      return wavFile;
    } catch (error) {
      console.error('Ошибка при подготовке аудио файла:', error);
      return null;
    }
  }, [audioBlob]);

  // Функция для конвертации AudioBuffer в WAV
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);
    
    // Записываем аудио данные
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  // Функция для показа уведомлений
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({
      message,
      type,
      isVisible: true
    });
  }, []);

  // Функция для скрытия уведомлений
  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  }, []);

  const submitAnswer = async (questionId?: number) => {
    if (!questionId) {
      console.error('Question ID is required for submission');
      showNotification('Ошибка: ID вопроса не найден', 'error');
      return;
    }

    try {
      if (answerMode === 'text' && textAnswer.trim()) {
        // Отправляем текстовый ответ
        const useAnonymous = !isAuthenticated || !userId;
        const result = await createTextAnswer({
          question_id: questionId,
          answer_body: textAnswer.trim(),
          is_anonymous: useAnonymous,
          ...(userId ? { user_id: Number(userId) } : {}),
        }).unwrap();
        
        setUserAnswered(true);
        setSentAnswer(textAnswer.trim());
        setFeedback(result.feedback ?? null); // <-- сохраняем feedback
        showNotification('Текстовый ответ успешно отправлен!', 'success');
        console.log('Text answer submitted:', result);
      } else if (answerMode === 'voice' && audioBlob) {
        stopRecording();
        const audioFile = await prepareAudioForSubmission();
        if (audioFile) {
          // Отправляем голосовой ответ
          const useAnonymous = !isAuthenticated || !userId;
          const result = await createVoiceAnswer({
            question_id: questionId,
            audioFile,
            is_anonymous: useAnonymous,
            ...(userId ? { user_id: Number(userId) } : {}),
          }).unwrap();
          
          setUserAnswered(true);
          setSentAnswer(result.answer_body?.trim() || 'Голосовой ответ');
          setFeedback(result.feedback ?? null); // <-- сохраняем feedback
          showNotification('Голосовой ответ успешно отправлен!', 'success');
          console.log('Voice answer submitted:', result);
        } else {
          showNotification('Ошибка при подготовке аудио файла', 'error');
        }
      } else {
        showNotification('Пожалуйста, введите ответ или запишите голосовое сообщение', 'error');
      }
    } catch (error) {
      setFeedback(null); // сбрасываем feedback при ошибке
      console.error('Error submitting answer:', error);
      showNotification('Ошибка при отправке ответа. Попробуйте еще раз.', 'error');
    }
  };

  const resetAnswer = () => {
    setUserAnswered(false);
    setSentAnswer(null);
    setTextAnswer('');
    setAudioBlob(null);
    setTimeLeft(120);
    timeLeftRef.current = 120; // Сбрасываем ref
    setHasRecorded(false);
    setFeedback(null); // сбрасываем feedback при сбросе
    stopRecordingInternal();
  };

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      console.log('Component unmounting, cleaning up');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        console.log('Timer cleared on unmount');
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        console.log('MediaRecorder stopped on unmount');
      }
    };
  }, []); // Убираем зависимость от isRecording

  return {
    answerMode,
    textAnswer,
    userAnswered,
    sentAnswer,
    isRecording,
    timeLeft,
    audioBlob,
    hasRecorded,
    isSubmitting: isSubmittingText || isSubmittingVoice,
    notification,
    switchToText,
    switchToVoice,
    updateTextAnswer,
    startRecording,
    stopRecording,
    submitAnswer,
    resetAnswer,
    hideNotification,
    feedback, // <-- добавляем feedback в возвращаемый объект
  };
}; 