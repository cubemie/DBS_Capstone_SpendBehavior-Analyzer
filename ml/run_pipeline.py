import os
from src.data_clean.preprocessing import load_and_preprocess_data
from src.models.train_model import train_and_save_model 
import tensorflow as tf
import numpy as np
def main():
    # 1. Definisikan path
    DATA_PATH = "data/budu_user_profiles_idr.csv"
    SCALER_PATH = "models/scaler.pkl"
    MODEL_PATH = "models/persona_classifier.keras"

    os.makedirs("models", exist_ok=True)
    os.makedirs("data/processed", exist_ok=True)

   #Mulai preprocessing data
    X_train, X_val, X_test, y_train, y_val, y_test = load_and_preprocess_data(
        data_path=DATA_PATH, 
        scaler_save_path=SCALER_PATH
    )
    print(f"Bentuk data training: {X_train.shape}")

    print("\n=== 2. Memulai Training AI Model ===")
    train_and_save_model(
        X_train=X_train, 
        y_train=y_train, 
        X_val=X_val, 
        y_val=y_val, 
        model_save_path=MODEL_PATH
    )
    print("\n=== Pipeline Selesai! Model siap digunakan. ===")
    
if __name__ == "__main__":
    main()