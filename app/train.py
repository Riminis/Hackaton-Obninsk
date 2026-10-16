import os
import torch
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from app.audio_utils import preprocess_audio, extract_features

def load_dataset(data_dir: str = "data"):
    X = []
    y = []
    classes = sorted(os.listdir(data_dir))
    
    for label_idx, class_name in enumerate(classes):
        class_path = os.path.join(data_dir, class_name)
        if not os.path.isdir(class_path):
            continue
            
        for file_name in os.listdir(class_path):
            if file_name.endswith((".wav", ".mp3")):
                file_path = os.path.join(class_path, file_name)
                try:
                    waveform = preprocess_audio(file_path)
                    features = extract_features(waveform)
                    X.append(features.numpy())
                    y.append(label_idx)
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")
                    
    return np.array(X), np.array(y), classes

if __name__ == "__main__":
    X, y, classes = load_dataset()
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"Accuracy: {acc:.2f}")
    
    joblib.dump({"model": model, "classes": classes}, "model.joblib")
