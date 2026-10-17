import torch
import torchaudio
import torchaudio.functional as F
import librosa
import numpy as np
from scipy.signal import butter, sosfilt
import tempfile
import soundfile as sf
import unittest

def apply_highpass_filter(audio_data, sample_rate, cutoff=100.0):
    nyquist = 0.5 * sample_rate
    if cutoff >= nyquist:
        return audio_data
    sos = butter(1, cutoff / nyquist, btype='high', output='sos')
    filtered = sosfilt(sos, audio_data)
    return np.ascontiguousarray(filtered)

def preprocess_audio(file_path: str, target_sample_rate: int = 16000, target_duration_sec: float = 5.0, min_rms: float = 0.005) -> torch.Tensor:
    data, sample_rate = librosa.load(file_path, sr=None)
    sample_rate = int(sample_rate)

    if len(data.shape) > 1:
        data = np.mean(data, axis=0)

    rms = float(np.sqrt(np.mean(data ** 2)))
    if rms < min_rms:
        raise ValueError("Запись слишком тихая или содержит только фоновый шум.")

    data = apply_highpass_filter(data, sample_rate)

    waveform = torch.tensor(data, dtype=torch.float32).unsqueeze(0)

    if sample_rate != target_sample_rate:
        waveform = F.resample(waveform, sample_rate, target_sample_rate)

    target_length = int(target_sample_rate * target_duration_sec)
    current_length = waveform.shape[1]

    if current_length > target_length:
        waveform = waveform[:, :target_length]
    elif current_length < target_length:
        padding = target_length - current_length
        waveform = torch.nn.functional.pad(waveform, (0, padding))

    return waveform

def extract_features(waveform: torch.Tensor, sample_rate: int = 16000) -> torch.Tensor:
    mfcc_transform = torchaudio.transforms.MFCC(
        sample_rate=sample_rate,
        n_mfcc=13,
        melkwargs={"n_fft": 400, "hop_length": 160, "n_mels": 23}
    )
    mfcc = mfcc_transform(waveform)
    features = torch.mean(mfcc, dim=2)
    return features.squeeze(0)

class AudioUtilsTestCase(unittest.TestCase):
    def test_preprocess_and_features(self):
        sr = 16000
        duration = 3.0
        t = np.linspace(0, duration, int(sr * duration), endpoint=False)
        audio = 0.1 * np.sin(2 * np.pi * 440 * t)
        
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=True) as tf:
            sf.write(tf.name, audio, sr)
            waveform = preprocess_audio(tf.name, target_sample_rate=sr, target_duration_sec=duration, min_rms=0.01)
            self.assertEqual(waveform.shape, (1, int(sr * duration)))
            features = extract_features(waveform, sample_rate=sr)
            self.assertEqual(features.shape, (13,))

if __name__ == "__main__":
    unittest.main()
