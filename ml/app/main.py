from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import numpy as np
import tensorflow as tf
import joblib
import pandas as pd  # Tambahkan import pandas untuk membaca data saat tes

# 1. Inisialisasi Aplikasi API
app = FastAPI(title="SpendBehavior AI API")

# 2. Muat Model dan Scaler ke memori (Global Variables)
try:
    model = tf.keras.models.load_model("models/persona_classifier.keras")
    scaler = joblib.load("models/scaler.pkl")
    print("Model & Scaler berhasil dimuat!")
except Exception as e:
    print(f"Gagal memuat artifacts AI: {e}")

PERSONA_LABELS = {0: "Emotional Spender", 1: "Impulsive Spender", 2: "Rational Spender"}

# Skema Input untuk Production (dari Backend)
class PredictionRequest(BaseModel):
    features: List[float]

# --- FUNGSI RULE-BASED: SMART WARNING SYSTEM ---
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
# --- 1. ENDPOINT PRODUCTION (Untuk digunakan oleh Tim Backend/Web) ---
@app.post("/predict")
def predict_persona(payload: PredictionRequest):
    if model is None or scaler is None:
        raise HTTPException(status_code=503, detail="Model AI belum siap.")

    input_data = np.array([payload.features])
    scaled_data = scaler.transform(input_data)
    
    preds = model.predict(scaled_data, verbose=0)[0]
    class_idx = int(np.argmax(preds))
    
    return {
        "persona": PERSONA_LABELS[class_idx],
        "confidence": float(preds[class_idx]),
        "probabilities": {
            "emotional": float(preds[0]),
            "impulsive": float(preds[1]),
            "rational": float(preds[2])
        }
    }


# --- 2. ENDPOINT KHUSUS TES LANGSUNG DI API (TANPA INPUT MANUAL) ---
@app.get("/test-random")
def test_random_user_directly():
    if model is None or scaler is None:
        raise HTTPException(status_code=503, detail="Model AI belum siap.")
    
    try:
        # Jalur file disesuaikan dengan posisi running uvicorn di root
        df = pd.read_csv("data/budu_user_profiles_idr.csv")
        
        # Ambil 1 data user secara acak
        random_user = df.sample(n=1).iloc[0]
        
        # Susun fitur dengan urutan yang benar (Sama dengan pipeline)
        feature_cols = [
            'total_spending_idr', 'avg_txn_idr', 'median_txn_idr', 'max_txn_idr', 
            'txn_count', 'std_amount_idr', 'weekend_ratio', 'night_ratio', 
            'month_start_ratio', 'month_end_ratio', 'above_avg_ratio', 'spike_ratio', 
            'impulse_score', 'unique_categories', 'unique_merchants', 'active_months', 
            'spending_cov', 'avg_dist_merchant'
        ]
        cat_cols = [col for col in df.columns if col.startswith('cat_')]
        feature_cols.extend(cat_cols)
        
        # Konversi data menjadi float standar Python agar bisa di-JSON
        features_array = random_user[feature_cols].fillna(0).astype(float).values.tolist()
        
        # Jalankan Prediksi AI
        input_data = np.array([features_array])
        scaled_data = scaler.transform(input_data)
        preds = model.predict(scaled_data, verbose=0)[0]
        class_idx = int(np.argmax(preds))
        
        # Kembalikan response lengkap dengan info pembanding dari CSV asli
       # Ubah data Pandas Series menjadi Dictionary untuk dibaca oleh fungsi Rules
        profile_dict = random_user.to_dict()
        
        # Jalankan deteksi Rule-Based
        warnings = get_smart_warnings(profile_dict)
        
        # Kembalikan response lengkap (AI + Rule-Based)
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
            "smart_warnings_system": warnings  # <--- INI HASIL RULE-BASED NYA
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saat testing: {str(e)}")