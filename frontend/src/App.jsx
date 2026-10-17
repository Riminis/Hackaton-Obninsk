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

const label = { slotProps: { input: { 'aria-label': 'Switch demo' } } };


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
    const [recordingSubmitted, setRecordingSubmitted] = useState(false);
    const [originalAudioUrl, setOriginalAudioUrl] = useState(null);
    const MAX_FILE_SIZE = 1024 * 1024; // 1 МБ
    const MAX_AUDIO_DURATION = 5; // строго меньше 5 секунд
    const MAX_RECORDING_DURATION = 5000; // 5 секунд
    const recordingTimerRef = useRef(null);
    const recordingStartTimeRef = useRef(null);
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

    useEffect(() => {
      return () => {
        if (processedAudioUrl) {
          URL.revokeObjectURL(processedAudioUrl);
        }
      };
    }, [processedAudioUrl]);
    
      
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

          const duration = recordingStartTimeRef.current == null
            ? 0
            : (performance.now() - recordingStartTimeRef.current) / 1000;

          const blob = new Blob(chunks, {
            type: recorder.mimeType || 'audio/webm',
          });

          console.log('Длительность записи:', duration);
          console.log('Размер записи:', blob.size);
          console.log('Тип файла:', blob.type);

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
            setAudioDuration(duration);
            setPrediction(null);
          }

          stream.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
          mediaRecorderRef.current = null;
          setIsRecording(false);
        };


        mediaRecorderRef.current = recorder;

        recordingStartTimeRef.current = performance.now();

        recorder.start();
        setIsRecording(true);

        console.log('Запись началась');
        console.log('Формат записи:', recorder.mimeType);

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
        );

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
  const uploadAudio = async (file, knownDuration = null) => {
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
    let duration = knownDuration;

    if (duration === null) {
      try {
        duration = await getAudioDuration(file);
      } catch (error) {
        setPredictionError(
          error.message || 'Не удалось прочитать аудиофайл'
        );
        return;
      }
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

      const response = await fetch('/api/predict', {
        method: 'POST',
        body: formData,
      });

      const responseText = await response.text();

      console.log('HTTP статус:', response.status);
      console.log('Ответ сервера:', responseText);

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

      <Box
        sx={{
          colorScheme: 'light',
          color: '#222222',
          minHeight: '100vh',
          width: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: '20vh',
        }}
      >
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
                  uploadAudio(selectedFile, audioDuration);
                }}
                >
                  Отправить запись
                </Button>
            )}

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Длительность — менее 5 секунд.
              </Typography>
          </Box>
          
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span
              style={{
                fontFamily: 'Roboto',
                fontSize: '24px',
              }}
            >
              Удалить фоновый шум
            </span>
          <Checkbox
              checked={removeNoise}
              onChange={(event) => setRemoveNoise(event.target.checked)}
            />
          </Box>
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
          </Box>
        )}
                   
          {isPredicting && (
            <Box
              sx={{
                width: 'min(850px, 90%)',
                mt: 3,
                mx: 'auto',
                p: 3,
                boxSizing: 'border-box',
                borderRadius: '12px',
                backgroundColor: '#fff',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                textAlign: 'center',
              }}
            >
              <Typography variant="h6">
                Анализируем звук...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Определяем класс объекта по звуковому сигналу
              </Typography>
            </Box>
          )}

          {predictionError && (
            <Box
              sx={{
                width: 'min(850px, 90%)',
                mt: 3,
                mx: 'auto',
                p: 2.5,
                boxSizing: 'border-box',
                borderRadius: '12px',
                backgroundColor: '#fff',
                border: '1px solid #ffcaca',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              }}
            >
              <Typography variant="h6" sx={{ color: '#c62828', mb: 1 }}>
                Не удалось распознать звук
              </Typography>
              <Typography color="text.secondary">
                {predictionError}
              </Typography>
            </Box>
          )}

          {prediction && (
            <Box
              sx={{
                width: 'min(850px, 90%)',
                mt: 3,
                mx: 'auto',
                p: { xs: 2, sm: 3 },
                boxSizing: 'border-box',
                borderRadius: '12px',
                backgroundColor: '#fff',
                boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                border: '1px solid #eeeeee',
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: '#222',
                  mb: 2.5,
                }}
              >
                Результат распознавания
              </Typography>

              {(() => {
                const rawClass = String(
                  prediction.predicted_class ??
                  prediction.material ??
                  prediction.label ??
                  prediction.prediction ??
                  'Не определён'
                );

                const normalizedClass = rawClass.toLowerCase();

                const displayClass = normalizedClass.includes('wood')
                  ? 'Дерево'
                  : normalizedClass.includes('metal')
                    ? 'Металл'
                    : rawClass;

                const rawConfidence =
                  prediction.confidence ?? prediction.probability;

                const confidence = Number(rawConfidence);

                const hasConfidence =
                  rawConfidence != null && Number.isFinite(confidence);

                const confidencePercent = hasConfidence
                  ? Math.max(
                      0,
                      Math.min(
                        100,
                        confidence <= 1 ? confidence * 100 : confidence
                      )
                    )
                  : null;

                return (
                  <Box
                    sx={{
                      width: '100%',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          sm: '1fr 1fr',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          backgroundColor: '#fafafa',
                          borderBottom: '1px solid #e5e5e5',
                          borderRight: {
                            xs: 'none',
                            sm: '1px solid #e5e5e5',
                          },
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          Класс объекта
                        </Typography>

                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: '#222',
                            overflowWrap: 'anywhere',
                          }}
                        >
                          {displayClass}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          p: 2,
                          backgroundColor: '#fff',
                          borderBottom: '1px solid #e5e5e5',
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          Уверенность модели
                        </Typography>

                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: '#222',
                          }}
                        >
                          {confidencePercent !== null
                            ? `${confidencePercent.toFixed(1)}%`
                            : 'Нет данных'}
                        </Typography>

                        {confidencePercent !== null && (
                          <Box
                            sx={{
                              mt: 1.5,
                              height: 6,
                              backgroundColor: '#eeeeee',
                              borderRadius: 10,
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                width: `${confidencePercent}%`,
                                height: '100%',
                                backgroundColor: '#e00000',
                                borderRadius: 10,
                                transition: 'width 0.3s ease',
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                );
              })()}
            </Box>
          )}

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
                href="https://t.me/CharlottaWo"
                target="_blank"
                rel="noopener noreferrer"
                sx={footerLinkSx}
              >
                Telegram Frontend
              </Box>

              <Box
                component="a"
                href="https//t.me/Riminis"
                sx={footerLinkSx}
              >
                Telegram Backend
              </Box>
            </Box>
          </Box>
        </Box>
    </Box>
  );
}
