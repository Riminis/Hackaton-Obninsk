import torch
import torchaudio
import torchaudio.functional as F
import librosa
import numpy as np

def preprocess_audio(file_path: str, target_sample_rate: int = 16000, target_duration_sec: float = 3.0) -> torch.Tensor:
    data, sample_rate = librosa.load(file_path, sr=None)
    sample_rate = int(sample_rate)

    if len(data.shape) > 1:
        data = np.mean(data, axis=0)

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
