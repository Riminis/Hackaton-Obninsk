import torch
import torchaudio
import torchaudio.functional as F

def preprocess_audio(file_path: str, target_sample_rate: int = 16000, target_duration_sec: float = 3.0) -> torch.Tensor:
    waveform, sample_rate = torchaudio.load(file_path)
    
    if waveform.shape[0] > 1:
        waveform = torch.mean(waveform, dim=0, keepdim=True)
        
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
