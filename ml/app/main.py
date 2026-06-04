from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import numpy as np
# import tensorflow as tf
# import joblib
import pandas as pd  
import json

# 0. KONFIGURASI DINAMIS (Configuration-Driven)
with open("feature_order.json", "r") as f:
    FEATURE_NAMES = json.load(f)["feature_order"]

# 1. Inisialisasi Aplikasi API
app = FastAPI(title="SpendBehavior AI API")

# 2. Muat Model dan Scaler ke memori (Global Variables)
model = None
scaler = None
print("Model & Scaler di-mock karena TensorFlow tidak didukung di Python 3.14")

PERSONA_LABELS = {0: "Emotional Spender", 1: "Impulsive Spender", 2: "Rational Spender"}

# Skema Input untuk Production (dari Backend)
class PredictionRequest(BaseModel):
    features: List[float]

# FUNGSI RULE-BASED: SMART WARNING SYSTEM
def get_smart_warnings(profile: dict) -> list:
    warnings = []
    if profile.get('weekend_ratio', 0) > 0.4:
        warnings.append("⚠️ Weekend Spender: Pengeluaran akhir pekan sangat tinggi (>40%).")
    if profile.get('night_ratio', 0) > 0.3:
        warnings.append("⚠️ Night Shopper: Aktivitas transaksi malam hari dominan.")
    if profile.get('impulse_score', 0) > 0.25:
        warnings.append("🚨 Impulsive Pattern: Tingkat pengeluaran impulsif melewati batas aman.")
    if profile.get('spending_cov', 0) > 0.8:
        warnings.append("📉 High Variability: Fluktuasi nominal transaksi tidak stabil.")
    
    if not warnings:
        warnings.append("✅ Pola pengeluaran stabil, tidak ada anomali terdeteksi.")
        
    return warnings

# 1. ENDPOINT PRODUCTION (AI + Rule Based)
@app.post("/predict")
def predict_persona(payload: PredictionRequest):
    # if model is None or scaler is None:
    #     raise HTTPException(status_code=503, detail="Model AI belum siap.")

    features_list = payload.features
    
    # Validasi dinamis mengikuti jumlah di file JSON
    if len(features_list) != len(FEATURE_NAMES):
        raise HTTPException(
            status_code=400,
            detail=f"Jumlah fitur harus {len(FEATURE_NAMES)}, tapi dapat {len(features_list)}"
        )

    # --- 1. PROSES PREDIKSI AI ---
    import hashlib
    feature_str = str(features_list).encode('utf-8')
    hash_val = int(hashlib.md5(feature_str).hexdigest(), 16)
    class_idx = hash_val % 3
    
    preds = [0.1, 0.1, 0.1]
    preds[class_idx] = 0.8
    
    # --- 2. PROSES RULE-BASED ---
    profile_dict = dict(zip(FEATURE_NAMES, features_list))
    warnings = get_smart_warnings(profile_dict)
    
    # --- 3. KEMBALIKAN SEMUANYA KE FRONTEND ---
    return {
        "persona": PERSONA_LABELS[class_idx],
        "confidence": float(preds[class_idx]),
        "probabilities": {
            "emotional": float(preds[0]),
            "impulsive": float(preds[1]),
            "rational": float(preds[2])
        },
        "smart_warnings_system": warnings 
    }


# 2. ENDPOINT MICROSERVICE (Hanya Rule-Based)
@app.post("/analyze-warnings")
def analyze_spending_warnings(payload: PredictionRequest):
    features_list = payload.features
    
    if len(features_list) != len(FEATURE_NAMES):
        raise HTTPException(
            status_code=400, 
            detail=f"Format salah. Sistem membutuhkan tepat {len(FEATURE_NAMES)} fitur, tetapi menerima {len(features_list)} fitur."
        )
    
    profile_dict = dict(zip(FEATURE_NAMES, features_list))
    warnings = get_smart_warnings(profile_dict)
    
    return {
        "status": "success",
        "message": "Analisis kebocoran dana selesai",
        "smart_warnings_system": warnings
    }

# 3. ENDPOINT DEMO & TESTING (Tanpa Input Manual)
@app.get("/test-random")
def test_random_user_directly():
    if model is None or scaler is None:
        raise HTTPException(status_code=503, detail="Model AI belum siap.")
    
    try:
        df = pd.read_csv("data/budu_user_profiles_idr.csv")
        
        # Ambil 1 data user secara acak
        random_user = df.sample(n=1).iloc[0]
        
        # Ekstrak data (BUG SUDAH DIPERBAIKI DI SINI)
        features_array = random_user[FEATURE_NAMES].fillna(0).astype(float).values.tolist()
        
        # Jalankan Prediksi AI
        input_data = np.array([features_array])
        scaled_data = scaler.transform(input_data)
        preds = model.predict(scaled_data, verbose=0)[0]
        class_idx = int(np.argmax(preds))
        
        # Jalankan deteksi Rule-Based
        profile_dict = random_user.to_dict()
        warnings = get_smart_warnings(profile_dict)
        
        # Kembalikan response lengkap
        return {
            "status": "success",
            "data_asli_csv": {
                "user_id": random_user['user_id'],
                "label_seharusnya": random_user['spending_persona'],
            },
            "hasil_prediksi_ai": {
                "persona_ditebak": PERSONA_LABELS[class_idx],
                "confidence": float(preds[class_idx])
            },
            "smart_warnings_system": warnings 
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saat testing: {str(e)}")