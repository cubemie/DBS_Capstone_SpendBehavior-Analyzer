import os
# Sesuaikan import dengan nama folder Anda (misal: src.preprocessing)
from src.data_clean.preprocessing import load_and_preprocess_data
from src.models.train_model import train_and_save_model 
import tensorflow as tf
import numpy as np
def main():
    # 1. Definisikan path
    DATA_PATH = "data/budu_user_profiles_idr.csv"
    SCALER_PATH = "models/scaler.pkl"
    MODEL_PATH = "models/persona_classifier.keras"

    # Buat folder jika belum ada agar tidak error
    os.makedirs("models", exist_ok=True)
    os.makedirs("data/processed", exist_ok=True)

    print("=== 1. Memulai Preprocessing Data ===")
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
    
# ==========================================
    # 3. KODE FITUR PENGETESAN LANGSUNG (SANITY CHECK)
    # ==========================================
    print("\n=== 3. Menjalankan Tes Prediksi Otomatis ===")
    
    # Memuat kembali model yang baru saja disimpan ke memori
    model = tf.keras.models.load_model(MODEL_PATH)
    
    # Ambil baris pertama dari data X_test (data yang tidak dipakai saat training)
    # Gunakan format slice [0:1] agar bentuk datanya tetap berupa matriks 2D
    sample_data = X_test[0:1] 
    label_asli = y_test[0]
    
    # Jalankan prediksi offline
    preds = model.predict(sample_data, verbose=0)[0]
    class_idx = int(np.argmax(preds))
    
    # Kamus penerjemah kode angka menjadi teks label
    label_dict = {0: "Emotional Spender", 1: "Impulsive Spender", 2: "Rational Spender"}
    
    print("-" * 40)
    print(f"Label Seharusnya (Data Asli) : {label_dict[label_asli]}")
    print(f"Hasil Tebakan AI             : {label_dict[class_idx]}")
    print(f"Tingkat Keyakinan (Confidence): {float(preds[class_idx]) * 100:.2f}%")
    print("-" * 40)

if __name__ == "__main__":
    main()