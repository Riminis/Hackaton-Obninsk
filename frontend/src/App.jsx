
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
  return (

    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: '20vh',
      }}
    >
      <h1>Опознаватель объекта по звуку</h1>

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
          onChange={(event) => console.log(event.target.files)}
          multiple
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
