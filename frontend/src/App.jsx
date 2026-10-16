
import Button from '@mui/material/Button';
import SpectrogramView from './Spectrogram';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import Switch from '@mui/material/Switch';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Checkbox from '@mui/material/Checkbox';
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
    const [removeNoise, setRemoveNoise] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
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
            mt: '40vh', // опускаем коробку ниже
            width: 'min(400px, 85%)', // была 500px
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px 18px', // уменьшаем внутренние отступы
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2, // меньше расстояние между текстом и кнопкой
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
          }}
        >
          <span
            style={{
              fontFamily: 'Roboto, sans-serif',
              fontSize: '20px',
              color: '#333333',
              textAlign: 'center',
            }}
          >
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
              '&:hover': {
                backgroundColor: '#cc0000',
              },
            }}
          >
            Upload your files

            <VisuallyHiddenInput
              type="file"
              accept=".mp3,audio/mpeg"
              onChange={handleFileChange}
            />
          </Button>
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
