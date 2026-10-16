
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';

const label = { slotProps: { input: { 'aria-label': 'Switch demo' } } };

export default function App() {
  return (
    <Box sx={{ p: 4 }}>
      <h1>Опознаватель объекта по звуку</h1>

      <Button variant="contained">
        Добавьте файл
      </Button>
    </Box>
  );
}
