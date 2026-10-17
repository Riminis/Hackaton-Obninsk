import os
import tempfile
import soundfile as sf
import numpy as np
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_predict_endpoint():
    sr = 16000
    duration = 3.0
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    audio = 0.2 * np.sin(2 * np.pi * 440 * t)

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tf:
        sf.write(tf.name, audio, sr)
        temp_filename = tf.name

    try:
        with open(temp_filename, "rb") as f:
            response = client.post(
                "/api/predict",
                files={"file": ("test_audio.wav", f, "audio/wav")}
            )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "predicted_class" in data
        assert "confidence" in data
        assert "duration" in data
        assert "filename" in data
        
        assert isinstance(data["confidence"], float)
        assert data["duration"] > 0.0
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
