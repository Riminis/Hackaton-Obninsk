
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
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

    const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Отправляем файл:', file.name, file.size, 'байт');

      const response = await fetch('/api/predict', {
        method: 'POST',
        body: formData,
      });

      const responseText = await response.text();

      console.log('HTTP статус:', response.status);
      console.log('Ответ сервера:', responseText);

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${responseText}`
        );
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
      <span
        style={{
          fontFamily: 'Roboto',
          fontSize: '24px',
        }}
      >Поддерживаемые форматы:mp3</span>

      <Button
        component="label"
        role={undefined}
        variant="contained"
        tabIndex={-1}
        startIcon={<CloudUploadIcon />}
        sx={{
          mt: '35vh',
          backgroundColor: '#ff0000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#cc0000',
          },
        }}
      >
        Upload your mp3

        <VisuallyHiddenInput
          type="file"
          accept=".mp3,audio/mpeg"
          onChange={handleFileChange}
        />
      </Button>
       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span
            style={{
              fontFamily: 'Roboto',
              fontSize: '24px',
            }}
          >
            Удалить фоновый шум
          </span>
         <Checkbox />
        </Box>
    
    </Box>
  );
}
