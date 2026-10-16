import { useRef, useState } from 'react';
import Button from '@mui/material/Button';
import SpectrogramView from './Spectrogram';
import Box from '@mui/material/Box';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Checkbox from '@mui/material/Checkbox';
import { styled } from '@mui/material/styles';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
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



export default function App() {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const [removeNoise, setRemoveNoise] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
      const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType });

        const recordedFile = new File(
          [blob],
          'recording.webm',
          { type: recorder.mimeType }
        );

        setSelectedFile(recordedFile);

        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        mediaRecorderRef.current = null;
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (error) {
      console.error('Ошибка микрофона:', error);
      alert('Не удалось включить микрофон. Проверь разрешения браузера.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
  };
        const uploadAudio = async (file) => {
      const formData = new FormData();

      formData.append('file', file);
      formData.append('remove_noise', String(removeNoise));

      try {
        const response = await fetch('/api/predict', {
          method: 'POST',
          body: formData,
        });

        const responseText = await response.text();

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${responseText}`);
        }

        console.log('Ответ сервера:', responseText);
        alert('Аудио успешно отправлено!');
      } catch (error) {
        console.error('Ошибка отправки:', error);
        alert(`Ошибка: ${error.message}`);
      }
    };
    const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('remove_noise', String(removeNoise));

    try {
      console.log('Отправляем файл:', file.name, file.size, 'байт');
      console.log('Удаление шума:', removeNoise);

      const response = await fetch('/api/predict', {
        method: 'POST',
        body: formData,
      });

      const responseText = await response.text();

      console.log('HTTP статус:', response.status);
      console.log('Ответ сервера:', responseText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }

      alert('Файл успешно отправлен и обработан!');
    } catch (error) {
      console.error('Полная ошибка:', error);
      alert(`Ошибка: ${error.message}`);
    }
  };
  
  return (

      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: '20vh',
        }}
      >
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

      <Box
        sx={{
          mt: '40vh',
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
            Поддерживаемые форматы: MP3
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
              accept=".mp3,audio/mpeg"
              onChange={handleFileChange}
            />
          </Button>
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

          {selectedFile?.name === 'recording.webm' && (
            <Button
              variant="outlined"
              onClick={() => uploadAudio(selectedFile)}
            >
              Отправить запись
            </Button>
          )}
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
    </Box>
  );
}
