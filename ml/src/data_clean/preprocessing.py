import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib

def load_and_preprocess_data(data_path: str, scaler_save_path: str):
    df = pd.read_csv(data_path)
    
    # Fitur numerik utama
    feature_cols = [
        'total_spending_idr', 'avg_txn_idr', 'median_txn_idr', 'max_txn_idr', 
        'txn_count', 'std_amount_idr', 'weekend_ratio', 'night_ratio', 
        'month_start_ratio', 'month_end_ratio', 'above_avg_ratio', 'spike_ratio', 
        'impulse_score', 'unique_categories', 'unique_merchants', 'active_months', 
        'spending_cov', 'avg_dist_merchant'
    ]
    
    # Menambahkan semua fitur kategori belanja (cat_*)
    cat_cols = [col for col in df.columns if col.startswith('cat_')]
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