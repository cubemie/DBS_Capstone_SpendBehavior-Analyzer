import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib

def load_and_preprocess_data(data_path: str, scaler_save_path: str):
    df = pd.read_csv(data_path)
    
    # Fitur numerik utama
    feature_cols = [
        'avg_txn_idr',          # Spending magnitude (single representative)
        'txn_count',            # Activity volume
        'weekend_ratio',        # Temporal pattern - weekend vs weekday
        'night_ratio',          # Temporal pattern - night vs day
        'above_avg_ratio',      # Overspending tendency
        'spike_ratio',          # Spending irregularity / lack of planning
        'impulse_score',        # Direct impulse measurement
        'unique_categories',    # Spending diversity (strongest predictor)
        'spending_cov',         # Spending stability / coefficient of variation
    ]
    cat_cols = [
        'cat_makanan_minuman_ratio',     # r = -0.53
        'cat_transportasi_ratio',        # r = -0.44
        'cat_kesehatan_kecantik_ratio',     # r = -0.37
        'cat_sembako_kebutuhan__ratio',     # r = -0.27
        'cat_kesehatan_ratio',           # r = +0.26
        'cat_pendidikan_ratio',          # r = -0.25
        'cat_belanja_online_ratio',      # r = -0.24
        'cat_pulsa_data_ratio',        # r = -0.20
        'cat_hiburan_ratio',             # r = -0.11
        'cat_fashion_pakaian_ratio',     # r = -0.07
    ]
    feature_cols.extend(cat_cols)
    
    X = df[feature_cols].fillna(0)
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