import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
import json
def load_and_preprocess_data(data_path: str, scaler_save_path: str):
    df = pd.read_csv(data_path)
    
    # Fitur numerik utama
    with open("feature_order.json", "r") as f:
        FEATURE_NAMES = json.load(f)["feature_order"]
    
    X = df[FEATURE_NAMES].fillna(0)
    y = df['persona_encoded'].values
    
    # Stratified Split
    X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)
    X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp)
    
    # Standard Scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)
    
    joblib.dump(scaler, scaler_save_path)
    print(f"Scaler disimpan di: {scaler_save_path}")
    
    return X_train_scaled, X_val_scaled, X_test_scaled, y_train, y_val, y_test