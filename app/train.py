import os
import pandas as pd
import torch
import joblib
import numpy as np
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from app.audio_utils import preprocess_audio, extract_features
from sklearn.calibration import CalibratedClassifierCV

def load_dataset(csv_path: str = "data/metadata.csv", audio_dir: str = "data/audio"):
    df = pd.read_csv(csv_path)
    X = []
    y = []
    filenames = []
    
    classes = sorted(df['label'].unique())
    class_to_idx = {cls_name: idx for idx, cls_name in enumerate(classes)}
    
    for _, row in df.iterrows():
        fname = str(row['filename']).strip()
        file_path = os.path.join(audio_dir, fname)
        label_idx = class_to_idx[row['label']]
        
        waveform = preprocess_audio(file_path)
        features = extract_features(waveform)
        
        X.append(features.numpy())
        y.append(label_idx)
        filenames.append(fname)
        
    return np.array(X), np.array(y), classes, np.array(filenames)

if __name__ == "__main__":
    X, y, classes, filenames = load_dataset()
    
    indices = np.arange(len(X))
    X_train, X_test, y_train, y_test, idx_train, idx_test = train_test_split(
        X, y, indices, test_size=0.2, random_state=42, stratify=y
    )
    
    model = make_pipeline(StandardScaler(), CalibratedClassifierCV(SVC(kernel='rbf', C=1.0, random_state=42)))
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    
    print(f"\nОбщая точность (Accuracy): {acc:.2f}\n")
    print("Классификационный отчёт:")
    print(classification_report(y_test, preds, target_names=classes))
    
    print("Матрица ошибок (Confusion Matrix):")
    print(confusion_matrix(y_test, preds))
    
    print("\nДетализация ошибок на тестовой выборке:")
    misclassified_count = 0
    for true_lbl_idx, pred_lbl_idx, original_idx in zip(y_test, preds, idx_test):
        if true_lbl_idx != pred_lbl_idx:
            misclassified_count += 1
            fname = filenames[original_idx]
            true_name = classes[true_lbl_idx]
            pred_name = classes[pred_lbl_idx]
            print(f"Файл: {fname} | Реальный класс: {true_name} --> Предсказанный класс: {pred_name}")
            
    if misclassified_count == 0:
        print("Ошибок на тестовой выборке нет.")
        
    joblib.dump({"model": model, "classes": classes}, "model.joblib")
