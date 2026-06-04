from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Literal
import numpy as np
import tensorflow as tf
import joblib
import pandas as pd  
import json
from src.models.rules import detect_behavior_patterns, detect_money_leaks

# 0. KONFIGURASI DINAMIS (Configuration-Driven)
with open("feature_order.json", "r") as f:
    FEATURE_NAMES = json.load(f)["feature_order"]

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
class MoneyLeakTransaction(BaseModel):
    txn_id: str
    type: str
    category_id: str
    category: str
    amount: float
    transaction_date: str


class PredictionRequest(BaseModel):
    features: List[float]
    transactions: List[MoneyLeakTransaction] = Field(default_factory=list)


class SmartWarning(BaseModel):
    code: str
    title: str
    message: str
    label: str
    severity: Literal["info", "warning", "danger", "success"]


STABLE_WARNING = SmartWarning(
    code="spending_stable",
    title="Pola Pengeluaran Stabil",
    message="Pola pengeluaran stabil, tidak ada anomali terdeteksi.",
    label="Aman",
    severity="success",
)

# FUNGSI RULE-BASED: SMART WARNING SYSTEM
def get_smart_warnings(profile: dict) -> List[SmartWarning]:
    warnings = [
        SmartWarning(**warning)
        for warning in detect_behavior_patterns(profile)
    ]
    
    if not warnings:
        warnings.append(STABLE_WARNING)
        
    return warnings


def get_money_leaks(transactions: List[MoneyLeakTransaction]) -> list:
    rows = [transaction.model_dump() for transaction in transactions]
    transactions_df = pd.DataFrame(
        rows,
        columns=["txn_id", "type", "category_id", "category", "amount", "transaction_date"],
    )

    return detect_money_leaks(transactions_df)

# 1. ENDPOINT PRODUCTION (AI + Rule Based)
@app.post("/predict")
def predict_persona(payload: PredictionRequest):
    if model is None or scaler is None:
        raise HTTPException(status_code=503, detail="Model AI belum siap.")

    features_list = payload.features
    
    # Validasi dinamis mengikuti jumlah di file JSON
    if len(features_list) != len(FEATURE_NAMES):
        raise HTTPException(
            status_code=400,
            detail=f"Jumlah fitur harus {len(FEATURE_NAMES)}, tapi dapat {len(features_list)}"
        )

    # --- 1. PROSES PREDIKSI AI ---
    input_data = np.array([features_list])
    scaled_data = scaler.transform(input_data)
    
    preds = model.predict(scaled_data, verbose=0)[0]
    class_idx = int(np.argmax(preds))
    
    # --- 2. PROSES RULE-BASED ---
    profile_dict = dict(zip(FEATURE_NAMES, features_list))
    warnings = get_smart_warnings(profile_dict)
    money_leaks = get_money_leaks(payload.transactions)
    
    # --- 3. KEMBALIKAN SEMUANYA KE FRONTEND ---
    return {
        "persona": PERSONA_LABELS[class_idx],
        "confidence": float(preds[class_idx]),
        "probabilities": {
            "emotional": float(preds[0]),
            "impulsive": float(preds[1]),
            "rational": float(preds[2])
        },
        "smart_warnings_system": warnings,
        "money_leaks": money_leaks,
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
    money_leaks = get_money_leaks(payload.transactions)
    
    return {
        "status": "success",
        "message": "Analisis kebocoran dana selesai",
        "smart_warnings_system": warnings,
        "money_leaks": money_leaks,
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
            "smart_warnings_system": warnings,
            "money_leaks": [],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saat testing: {str(e)}")
