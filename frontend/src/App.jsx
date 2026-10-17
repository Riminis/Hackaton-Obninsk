import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import SpectrogramView from './Spectrogram';
import Box from '@mui/material/Box';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Checkbox from '@mui/material/Checkbox';
import { styled } from '@mui/material/styles';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import { useEffect, useRef, useState } from 'react';
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
const VisuallyHiddenInput = styled('input')({
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

<<<<<<< Updated upstream
=======
const label = { slotProps: { input: { 'aria-label': 'Switch demo' } } };


>>>>>>> Stashed changes
const footerLinkSx = {
  fontFamily: 'Roboto, sans-serif',
  fontSize: '14px',
  color: '#555',
  textDecoration: 'none',
  '&:hover': {
    color: '#e00000',
  },
};

export default function App() {
<<<<<<< Updated upstream
=======
    const [recordingSubmitted, setRecordingSubmitted] = useState(false);
>>>>>>> Stashed changes
    const [originalAudioUrl, setOriginalAudioUrl] = useState(null);
    const MAX_FILE_SIZE = 1024 * 1024; // 1 МБ
    const MAX_AUDIO_DURATION = 5; // строго меньше 5 секунд
    const MAX_RECORDING_DURATION = 5000; // 5 секунд
    const recordingTimerRef = useRef(null);
    const [processedAudioUrl, setProcessedAudioUrl] = useState(null);
    const [audioDuration, setAudioDuration] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const [prediction, setPrediction] = useState(null);
    const [isPredicting, setIsPredicting] = useState(false);
    const [predictionError, setPredictionError] = useState("");
    const [removeNoise, setRemoveNoise] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
<<<<<<< Updated upstream

    // Инструментированная функция getAudioDuration с дебагом
    const getAudioDuration = (file) =>
      new Promise((resolve) => {
        console.log('[DEBUG] getAudioDuration вызван для файла:', {
          name: file.name,
          size: file.size,
          type: file.type,
        });

        const audio = new Audio();
        const url = URL.createObjectURL(file);

        audio.preload = 'metadata';

        audio.onloadedmetadata = () => {
          const duration = audio.duration;
          console.log('[DEBUG] onloadedmetadata сработал. audio.duration =', duration);
          URL.revokeObjectURL(url);

          if (!Number.isFinite(duration) || isNaN(duration)) {
            console.warn('[DEBUG] duration невалиден (NaN или Infinity). Пропускаем.');
            resolve(1.0); // временный fallback для теста
            return;
          }

          resolve(duration);
        };

        audio.onerror = (e) => {
          console.error('[DEBUG] audio.onerror сработал:', e);
          URL.revokeObjectURL(url);
          resolve(1.0); // временный fallback чтобы не падало
        };

        audio.src = url;
      });

    useEffect(() => {
      if (!selectedFile) {
        setOriginalAudioUrl(null);
        return;
      }

      const url = URL.createObjectURL(selectedFile);
      setOriginalAudioUrl(url);

      return () => URL.revokeObjectURL(url);
    }, [selectedFile]);

=======
    const getAudioDuration = (file) =>
    new Promise((resolve, reject) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);

      audio.preload = 'metadata';

      audio.onloadedmetadata = () => {
        const duration = audio.duration;
        URL.revokeObjectURL(url);

        if (!Number.isFinite(duration)) {
          reject(new Error('Не удалось определить длительность аудио'));
          return;
        }

        resolve(duration);
      };

      audio.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Не удалось прочитать аудиофайл'));
      };

      audio.src = url;
    });
    useEffect(() => {
      if (!selectedFile) {
        setOriginalAudioUrl(null);
        return;
      }

      const url = URL.createObjectURL(selectedFile);
      setOriginalAudioUrl(url);

      return () => URL.revokeObjectURL(url);
    }, [selectedFile]);

>>>>>>> Stashed changes
    useEffect(() => {
      return () => {
        if (processedAudioUrl) {
          URL.revokeObjectURL(processedAudioUrl);
<<<<<<< Updated upstream
        }
        if (recordingTimerRef.current) {
          clearTimeout(recordingTimerRef.current);
=======
>>>>>>> Stashed changes
        }
      };
    }, [processedAudioUrl]);
    
<<<<<<< Updated upstream
    const uploadAudio = async (file) => {
      if (!file) return;

      console.log('[DEBUG] uploadAudio запущен для файла:', file);
      setPrediction(null);
      setPredictionError('');

      if (processedAudioUrl) {
        URL.revokeObjectURL(processedAudioUrl);
        setProcessedAudioUrl(null);
      }

      // Проверка размера файла
      if (file.size > MAX_FILE_SIZE) {
        console.error('[DEBUG] Ошибка: файл слишком большой:', file.size);
        setPredictionError('Максимальный размер файла — 1 МБ.');
        return;
      }

      // Проверка длительности
      let duration;
      try {
        duration = await getAudioDuration(file);
        console.log('[DEBUG] Определена длительность:', duration);
      } catch (error) {
        console.error('[DEBUG] Ошибка в getAudioDuration:', error);
        duration = 1.0;
      }

      if (duration >= MAX_AUDIO_DURATION) {
        console.error('[DEBUG] Ошибка: превышена длительность:', duration);
        setPredictionError(
          'Длительность аудио должна быть меньше 5 секунд.'
=======
      
    const startRecording = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(
            'Браузер не поддерживает запись или сайт открыт не через HTTPS/localhost.'
          );
        }

        setRecordingSubmitted(false);
        setPrediction(null);
        setPredictionError('');
        setAudioDuration(null);

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        streamRef.current = stream;

        let mimeType = '';

        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else {
          mimeType = '';
        }

        const recorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);

        const chunks = [];

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        recorder.onerror = (event) => {
          console.error('Ошибка MediaRecorder:', event.error);
          setPredictionError('Ошибка во время записи звука.');
        };

        recorder.onstop = () => {
          clearTimeout(recordingTimerRef.current);

          const blob = new Blob(chunks, {
            type: recorder.mimeType || 'audio/webm',
          });

          if (blob.size === 0) {
            setPredictionError('Запись пустая. Попробуй записать звук ещё раз.');
          } else {
            const recordedFile = new File(
              [blob],
              'recording.webm',
              { type: blob.type }
            );

            setRecordingSubmitted(false);
            setSelectedFile(recordedFile);
            setPrediction(null);
            setAudioDuration(null);
          }

          stream.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
          mediaRecorderRef.current = null;
          setIsRecording(false);
        };

        mediaRecorderRef.current = recorder;
        recorder.start();
        setIsRecording(true);

        recordingTimerRef.current = setTimeout(() => {
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        }, MAX_RECORDING_DURATION);

      } catch (error) {
        console.error('Ошибка запуска микрофона:', error);

        setIsRecording(false);
        setPredictionError(
          error.name === 'NotAllowedError'
            ? 'Нет доступа к микрофону. Разреши использование микрофона в браузере.'
            : error.message || 'Не удалось запустить запись.'
>>>>>>> Stashed changes
        );
        return;
      }

<<<<<<< Updated upstream
      setSelectedFile(file);
      setAudioDuration(duration);
      setIsPredicting(true);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('remove_noise', String(removeNoise));

        console.log('[DEBUG] Отправка запроса на /api/predict...');
        const response = await fetch('/api/predict', {
          method: 'POST',
          body: formData,
        });

        console.log('[DEBUG] Статус ответа сервера:', response.status);
        const responseText = await response.text();
        console.log('[DEBUG] Текст ответа сервера:', responseText);

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (jsonErr) {
          console.error('[DEBUG] Не удалось распарсить JSON из ответа:', responseText);
          throw new Error(
            'Сервер вернул ответ не в формате JSON'
          );
        }

        if (!response.ok) {
          throw new Error(
            data.detail || `Ошибка сервера: HTTP ${response.status}`
          );
        }

        // Получение обработанного аудио от сервера
        if (data.processed_audio_base64) {
          const binary = atob(data.processed_audio_base64);
          const bytes = Uint8Array.from(
            binary,
            (char) => char.charCodeAt(0)
          );

          const blob = new Blob([bytes], {
            type: data.processed_audio_mime_type || 'audio/wav',
          });

          setProcessedAudioUrl(URL.createObjectURL(blob));
        }

        console.log('[DEBUG] Успешный ответ:', data);
        setPrediction(data);
      } catch (error) {
        console.error('[DEBUG] Ошибка в блоке catch uploadAudio:', error);
        setPredictionError(
          error.message || 'Не удалось распознать звук'
        );
      } finally {
        setIsPredicting(false);
      }
    };

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        streamRef.current = stream;

        const mimeType = MediaRecorder.isTypeSupported(
          'audio/webm;codecs=opus'
        )
          ? 'audio/webm;codecs=opus'
          : 'audio/webm';
=======
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        mediaRecorderRef.current = null;
      }
    };

  const stopRecording = () => {
      clearTimeout(recordingTimerRef.current);

      const recorder = mediaRecorderRef.current;

      if (recorder && recorder.state === 'recording') {
        recorder.stop();
      }

      setIsRecording(false);
    };
  const uploadAudio = async (file) => {
    if (!file) return;

    setPrediction(null);
    setPredictionError('');

    if (processedAudioUrl) {
      URL.revokeObjectURL(processedAudioUrl);
      setProcessedAudioUrl(null);
    }

    // Проверка размера файла
    if (file.size > MAX_FILE_SIZE) {
      setPredictionError('Максимальный размер файла — 1 МБ.');
      return;
    }

    // Проверка длительности
    let duration;

    try {
      duration = await getAudioDuration(file);
    } catch (error) {
      setPredictionError(
        error.message || 'Не удалось прочитать аудиофайл'
      );
      return;
    }

    if (duration >= MAX_AUDIO_DURATION) {
      setPredictionError(
        'Длительность аудио должна быть меньше 5 секунд.'
      );
      return;
    }

    setSelectedFile(file);
    setAudioDuration(duration);
    setIsPredicting(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('remove_noise', String(removeNoise));

      console.log('Отправляем файл:', {
        name: file.name,
        type: file.type,
        size: file.size,
      });
>>>>>>> Stashed changes

        const recorder = new MediaRecorder(stream, { mimeType });
        const chunks = [];

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        recorder.onstop = async () => {
          clearTimeout(recordingTimerRef.current);

<<<<<<< Updated upstream
          const blob = new Blob(chunks, { type: recorder.mimeType });

          const recordedFile = new File(
            [blob],
            'recording.webm',
            { type: recorder.mimeType }
          );

          stream.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
          mediaRecorderRef.current = null;
          setIsRecording(false);

          // Автоматическая отправка записанного файла на сервер
          await uploadAudio(recordedFile);
        };

        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);

        recordingTimerRef.current = setTimeout(() => {
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        }, MAX_RECORDING_DURATION);
      } catch (error) {
        console.error('Ошибка микрофона:', error);
        alert('Не удалось включить микрофон. Проверь разрешения браузера.');
        setIsRecording(false);
      }
    };

    const stopRecording = () => {
      clearTimeout(recordingTimerRef.current);

      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }

      setIsRecording(false);
    };
=======
      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error('Сервер вернул ответ не в формате JSON');
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
          `Ошибка сервера: HTTP ${response.status}`
        );
      }

      if (!data || typeof data !== 'object') {
        throw new Error(
          `Сервер вернул ${JSON.stringify(data)} вместо результата.`
        );
      }

      setPrediction(data);
    } catch (error) {
      console.error('Ошибка распознавания:', error);
      setPredictionError(
        error.message || 'Не удалось распознать звук'
      );
    } finally {
      setIsPredicting(false);
    }
  };

   
  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    // Позволяет повторно выбрать тот же файл
    event.target.value = '';

    if (!file) return;

    // Очищаем предыдущий результат при каждом новом выборе
    setPrediction(null);
    setPredictionError('');
    setAudioDuration(null);
    setRecordingSubmitted(false);
    if (processedAudioUrl) {
      URL.revokeObjectURL(processedAudioUrl);
      setProcessedAudioUrl(null);
    }

    if (originalAudioUrl) {
      URL.revokeObjectURL(originalAudioUrl);
      setOriginalAudioUrl(null);
    }

    setSelectedFile(null);

    // Проверяем размер: максимум 1 МБ
    if (file.size > 1 * 1024 * 1024) {
      setPredictionError('Файл слишком большой. Максимальный размер — 1 МБ.');
      return;
    }

    await uploadAudio(file);
  };


  return (
>>>>>>> Stashed changes

    const handleFileChange = async (event) => {
      const file = event.target.files?.[0];

      // Позволяет повторно выбрать тот же файл
      event.target.value = '';

      if (!file) return;

      // Очищаем предыдущий результат при каждом новом выборе
      setPrediction(null);
      setPredictionError('');
      setAudioDuration(null);

      if (processedAudioUrl) {
        URL.revokeObjectURL(processedAudioUrl);
        setProcessedAudioUrl(null);
      }

      if (originalAudioUrl) {
        URL.revokeObjectURL(originalAudioUrl);
        setOriginalAudioUrl(null);
      }

      setSelectedFile(null);

      // Проверяем размер: максимум 1 МБ
      if (file.size > MAX_FILE_SIZE) {
        setPredictionError('Максимальный размер файла — 1 МБ.');
        return;
      }

      await uploadAudio(file);
    };

    return (
      <Box
        sx={{
          minHeight: '100vh',
<<<<<<< Updated upstream
=======
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: '100%',
          boxSizing: 'border-box',
>>>>>>> Stashed changes
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          boxSizing: 'border-box',
          alignItems: 'center',
          pt: '20vh',
        }}
      >
<<<<<<< Updated upstream
        <Box
          sx={{
            width: '100%',
            maxWidth: '1000px',
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxSizing: 'border-box',
          }}
        >
          <h1
            style={{
              fontFamily: 'Arial',
              fontSize: '36px',
              fontWeight: 'bold',
            }}
          >
            Опознаватель объекта по звуку
          </h1>
          <span
            style={{
              fontFamily: 'Roboto',
              fontSize: '24px',
            }}
          >
            Полностью бесплатный онлайн-инструмент для определения класса объекта по записи звука его взаимодействия с окружающей средой
          </span>
          
          {/* Как работает сайт */}
          <Box
            sx={{
              width: 'min(850px, 90%)',
              mt: 5,
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                position: 'relative',
                gap: 2,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '18px',
                  left: '16.66%',
                  right: '16.66%',
                  height: '1px',
                  backgroundColor: '#d9d9d9',
                },
              }}
            >
              {[
                {
                  number: '01',
                  title: 'Загрузка аудио',
                  description: 'Загрузите MP3-файл или запишите звук с микрофона',
                },
                {
                  number: '02',
                  title: 'Анализ записи',
                  description: 'Система обработает звук и определит его признаки',
                },
                {
                  number: '03',
                  title: 'Результат',
                  description: 'Получите предсказанный класс объекта',
                },
              ].map((step) => (
                <Box
                  key={step.number}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative',
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      border: '1px solid #e00000',
                      color: '#e00000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'Roboto, sans-serif',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    {step.number}
                  </Box>

                  <Box
                    sx={{
                      fontFamily: 'Roboto, sans-serif',
                      fontSize: { xs: '14px', sm: '16px' },
                      fontWeight: 600,
                      color: '#222',
                    }}
                  >
                    {step.title}
                  </Box>

                  <Box
                    sx={{
                      fontFamily: 'Roboto, sans-serif',
                      fontSize: { xs: '12px', sm: '14px' },
                      lineHeight: 1.6,
                      color: '#777',
                      maxWidth: 220,
                    }}
                  >
                    {step.description}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              mt: '25vh',
              width: 'min(850px, 90%)',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'stretch',
              justifyContent: 'center',
              gap: 3,
            }}
          >
            {/* Карточка загрузки файла */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '24px 18px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              }}
            >
              <span style={{ fontFamily: 'Roboto', fontSize: '20px', color: '#333', textAlign: 'center' }}>
                Поддерживаемые форматы: MP3, WAV
              </span>

              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
                sx={{
                  backgroundColor: '#ff0000',
                  color: '#ffffff',
                  px: 4,
                  py: 1.5,
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontSize: '16px',
                  '&:hover': { backgroundColor: '#cc0000' },
                }}
              >
                Загрузить файл
                <VisuallyHiddenInput
                  type="file"
                  accept=".mp3,.wav,audio/mpeg,audio/wav,audio/x-wav,audio/wave"
                  onChange={handleFileChange}
                />
              </Button>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Максимальный размер — 1 МБ, длительность — менее 5 секунд.
              </Typography>
            </Box>

            {/* Карточка микрофона */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '24px 18px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              }}
            >
              <span style={{ fontFamily: 'Roboto', fontSize: '20px', color: '#333', textAlign: 'center' }}>
                Запись звука с микрофона
              </span>

              {!isRecording ? (
                <Button
                  variant="contained"
                  startIcon={<MicIcon />}
                  onClick={startRecording}
                  sx={{
                    backgroundColor: '#ff0000',
                    borderRadius: '10px',
                    textTransform: 'none',
                    px: 4,
                    py: 1.5,
                    '&:hover': { backgroundColor: '#cc0000' },
                  }}
                >
                  Начать запись
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<StopIcon />}
                  onClick={stopRecording}
                  sx={{
                    backgroundColor: '#333333',
                    borderRadius: '10px',
                    textTransform: 'none',
                    px: 4,
                    py: 1.5,
                  }}
                >
                  Остановить запись
                </Button>
              )}

              <Typography
=======
  <Box
  sx={{
    width: '100%',
    maxWidth: '1000px',
    mx: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxSizing: 'border-box',
  }}>
      <h1
        style={{
        fontFamily: 'Arial',
        fontSize: '36px',
        fontWeight: 'bold',
        }}
      >
        Опознаватель объекта по звуку</h1>
      <span
        style={{
        fontFamily: 'Roboto',
        fontSize: '24px',
        }}
      >Полностью бесплатный онлайн-инструмент для определения класса объекта по записи звука его взаимодействия с окружающей средой</span>
      
      {/* Как работает сайт */}
      <Box
        sx={{
          width: 'min(850px, 90%)',
          mt: 5,
          mb: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            position: 'relative',
            gap: 2,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '18px',
              left: '16.66%',
              right: '16.66%',
              height: '1px',
              backgroundColor: '#d9d9d9',
            },
          }}
        >
          {[
            {
              number: '01',
              title: 'Загрузка аудио',
              description: 'Загрузите MP3-файл или запишите звук с микрофона',
            },
            {
              number: '02',
              title: 'Анализ записи',
              description: 'Система обработает звук и определит его признаки',
            },
            {
              number: '03',
              title: 'Результат',
              description: 'Получите предсказанный класс объекта',
            },
          ].map((step) => (
            <Box
              key={step.number}
              sx={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: '#fff',
                  border: '1px solid #e00000',
                  color: '#e00000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {step.number}
              </Box>

              <Box
                sx={{
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: { xs: '14px', sm: '16px' },
                  fontWeight: 600,
                  color: '#222',
                }}
              >
                {step.title}
              </Box>

              <Box
                sx={{
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: { xs: '12px', sm: '14px' },
                  lineHeight: 1.6,
                  color: '#777',
                  maxWidth: 220,
                }}
              >
                {step.description}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

        <Box
          sx={{
            mt: '25vh',
            width: 'min(850px, 90%)',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'stretch',
            justifyContent: 'center',
            gap: 3,
          }}
        >
          {/* Карточка загрузки файла */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              boxSizing: 'border-box',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px 18px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            }}
          >
            <span style={{ fontFamily: 'Roboto', fontSize: '20px', color: '#333', textAlign: 'center' }}>
              Поддерживаемые форматы: MP3, WAV
            </span>

            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              sx={{
                backgroundColor: '#ff0000',
                color: '#ffffff',
                px: 4,
                py: 1.5,
                borderRadius: '10px',
                textTransform: 'none',
                fontSize: '16px',
                '&:hover': { backgroundColor: '#cc0000' },
              }}
            >
              Загрузить файл
              <VisuallyHiddenInput
                type="file"
                accept=".mp3,.wav,audio/mpeg,audio/wav,audio/x-wav,audio/wave"
                onChange={handleFileChange}
              />
            </Button>
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Максимальный размер — 1 МБ,
                длительность — менее 5 секунд.
              </Typography>
          </Box>

          {/* Карточка микрофона */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              boxSizing: 'border-box',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px 18px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            }}
          >
            <span style={{ fontFamily: 'Roboto', fontSize: '20px', color: '#333', textAlign: 'center' }}>
              Запись звука с микрофона
            </span>

            {!isRecording ? (
              <Button
                variant="contained"
                startIcon={<MicIcon />}
                onClick={startRecording}
                sx={{
                  backgroundColor: '#ff0000',
                  borderRadius: '10px',
                  textTransform: 'none',
                  px: 4,
                  py: 1.5,
                  '&:hover': { backgroundColor: '#cc0000' },
                }}
              >
                Начать запись
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<StopIcon />}
                onClick={stopRecording}
                sx={{
                  backgroundColor: '#333333',
                  borderRadius: '10px',
                  textTransform: 'none',
                  px: 4,
                  py: 1.5,
                }}
              >
                Остановить запись
              </Button>
            )}

            
            {selectedFile?.name === 'recording.webm' &&
              !isRecording &&
              !recordingSubmitted &&
              !isPredicting && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setRecordingSubmitted(true);
                    uploadAudio(selectedFile);
                  }}
                >
                  Отправить запись
                </Button>
            )}

            <Typography
>>>>>>> Stashed changes
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Длительность — менее 5 секунд.
              </Typography>
<<<<<<< Updated upstream
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3 }}>
=======
          </Box>
          
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
>>>>>>> Stashed changes
            <span
              style={{
                fontFamily: 'Roboto',
                fontSize: '24px',
              }}
            >
              Удалить фоновый шум
            </span>
<<<<<<< Updated upstream
            <Checkbox
=======
          <Checkbox
>>>>>>> Stashed changes
              checked={removeNoise}
              onChange={(event) => setRemoveNoise(event.target.checked)}
            />
          </Box>
<<<<<<< Updated upstream

          <SpectrogramView file={selectedFile} />

          {selectedFile && originalAudioUrl && (
            <Box
              sx={{
                width: 'min(850px, 90%)',
                mt: 3,
                p: 3,
                boxSizing: 'border-box',
                borderRadius: '16px',
                backgroundColor: '#fff',
                boxShadow: '0 8px 30px rgba(0,0,0,0.10)',
              }}
            >
              <h3>Прослушивание аудио</h3>

              <Box sx={{ mb: 2 }}>
                <div>Исходная запись: {selectedFile.name}</div>

                <audio
                  controls
                  preload="metadata"
                  src={originalAudioUrl}
                  style={{ width: '100%', marginTop: '8px' }}
                />
              </Box>

              {audioDuration !== null && (
                <p>
                  Длительность: {audioDuration.toFixed(2)} сек.
                </p>
              )}

              {removeNoise && (
                <Box sx={{ mt: 2 }}>
                  <h4>Запись после удаления шума</h4>

                  {processedAudioUrl ? (
                    <audio
                      controls
                      preload="metadata"
                      src={processedAudioUrl}
                      style={{ width: '100%' }}
                    />
                  ) : (
                    <p>
                      Обработанная запись появится после получения результата от сервера.
                    </p>
                  )}
                </Box>
              )}
            </Box>
          )}

          {isPredicting && (
=======
          <SpectrogramView file={selectedFile} />
          {selectedFile && originalAudioUrl && (
          <Box
            sx={{
              width: 'min(850px, 90%)',
              mt: 3,
              p: 3,
              boxSizing: 'border-box',
              borderRadius: '16px',
              backgroundColor: '#fff',
              boxShadow: '0 8px 30px rgba(0,0,0,0.10)',
            }}
          >
            <h3>Прослушивание аудио</h3>

            <Box sx={{ mb: 2 }}>
              <div>Исходная запись: {selectedFile.name}</div>

              <audio
                controls
                preload="metadata"
                src={originalAudioUrl}
                style={{ width: '100%', marginTop: '8px' }}
              />
            </Box>

            {audioDuration !== null && (
              <p>
                Длительность: {audioDuration.toFixed(2)} сек.
              </p>
            )}

            {removeNoise && (
              <Box sx={{ mt: 2 }}>
                <h4>Запись после удаления шума</h4>

                {processedAudioUrl ? (
                  <audio
                    controls
                    preload="metadata"
                    src={processedAudioUrl}
                    style={{ width: '100%' }}
                  />
                ) : (
                  <p>
                    Обработанная запись появится после получения
                    результата от сервера.
                  </p>
                )}
              </Box>
            )}
          </Box>
        )}
                    {isPredicting && (
>>>>>>> Stashed changes
            <div className="result-card result-loading">
              <div className="loader" />
              <h3>Анализируем звук...</h3>
              <p>Определяем материал по характеристикам удара</p>
            </div>
          )}

          {predictionError && (
            <div className="result-card result-error">
              <span className="result-icon">!</span>
              <div>
                <h3>Не удалось распознать звук</h3>
                <p>{predictionError}</p>
              </div>
            </div>
          )}

          {prediction && (
            <div className="result-card">
              <div className="result-heading">
                <div>
                  <span className="result-eyebrow">РЕЗУЛЬТАТ АНАЛИЗА</span>
                  <h2>Материал определён</h2>
                </div>

                <span className="result-check">✓</span>
              </div>

              <div className="material-result">
                <div className="material-symbol">
                  {String(
                      prediction.predicted_class ??
                      prediction.material ??
                      prediction.label ??
                      prediction.prediction
                  ).toLowerCase().includes("wood")
                    ? "🪵"
                    : "🔩"}
                </div>

                <div>
                  <span className="material-caption">Предполагаемый материал</span>

                  <h1>
                    {(() => {
                      const material = String(
                      prediction.predicted_class ??
                      prediction.material ??
                      prediction.label ??
                      prediction.prediction
                      ).toLowerCase();

                      if (material.includes("wood")) return "Дерево";
                      if (material.includes("metal")) return "Металл";

                      return prediction.material ??
                      prediction.predicted_class ??
                      prediction.material ??
                      prediction.label ??
                      prediction.prediction
                    })()}
                  </h1>

                  <span className="material-class">
                    Класс модели: {
                      prediction.predicted_class ??
                      prediction.material ??
                      prediction.label ??
                      prediction.prediction
                    }
                  </span>
                </div>
              </div>

              {(prediction.confidence != null ||
                prediction.probability != null) && (
                <div className="confidence-section">
                  <div className="confidence-label">
                    <span>Уверенность модели</span>
                    <strong>
                      {Math.round(
                        Number(prediction.confidence ?? prediction.probability) *
                        (Number(prediction.confidence ?? prediction.probability) <= 1
                          ? 100
                          : 1)
                      )}%
                    </strong>
                  </div>

                  <div className="confidence-track">
                    <div
                      className="confidence-fill"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            Number(prediction.confidence ?? prediction.probability) *
                              (Number(prediction.confidence ?? prediction.probability) <= 1
                                ? 100
                                : 1)
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {selectedFile && (
                <div className="result-file">
                  <span className="file-symbol">♫</span>
                  <div className="result-file-info">
                    <strong>{selectedFile.name}</strong>
                    <span>
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <span className="file-ready">Обработан</span>
                </div>
              )}

              <button
                className="result-button"
                onClick={() => {
                  setPrediction(null);
                  setPredictionError("");
                }}
              >
                Распознать другой звук
              </button>
            </div>
          )}
<<<<<<< Updated upstream
        </Box>

        <Box
          component="footer"
          sx={{
            mt: 'auto',
            width: '100%',
            py: 3,
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              maxWidth: 1000,
              mx: 'auto',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box
              sx={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '13px',
                color: '#999',
              }}
            >
              © {new Date().getFullYear()} Опознаватель объекта по звуку
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: { xs: 2, sm: 3 },
              }}
            >
              <Box
                component="a"
                href="https://t.me/your_username"
                target="_blank"
                rel="noopener noreferrer"
                sx={footerLinkSx}
              >
                Telegram
              </Box>

              <Box
                component="a"
                href="mailto:your-email@example.com"
                sx={footerLinkSx}
              >
                Почта
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
=======
      </Box>
<Box
  component="footer"
  sx={{
    mt: 'auto',
    width: '100%',
    py: 3,
    textAlign: 'center',
  }}
>
   <Box
            sx={{
              maxWidth: 1000,
              mx: 'auto',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box
              sx={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '13px',
                color: '#999',
              }}
            >
              © {new Date().getFullYear()} Опознаватель объекта по звуку
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: { xs: 2, sm: 3 },
              }}
            >
              <Box
                component="a"
                href="https://t.me/your_username"
                target="_blank"
                rel="noopener noreferrer"
                sx={footerLinkSx}
              >
                Telegram
              </Box>

              <Box
                component="a"
                href="mailto:your-email@example.com"
                sx={footerLinkSx}
              >
                Почта
              </Box>
            </Box>
          </Box>
        </Box>
    </Box>
  );
>>>>>>> Stashed changes
}
