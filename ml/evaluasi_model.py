import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix
from src.data_clean.preprocessing import load_and_preprocess_data

def evaluate_my_model():
    # 1. Tarik data testing yang belum pernah dilihat model
    DATA_PATH = "data/budu_user_profiles_idr.csv"
    SCALER_PATH = "models/scaler.pkl"
    MODEL_PATH = "models/persona_classifier.keras"

    # Kita hanya butuh X_test dan y_test untuk evaluasi
    _, _, X_test, _, _, y_test = load_and_preprocess_data(DATA_PATH, SCALER_PATH)

    # 2. Muat model yang sudah dilatih
    model = tf.keras.models.load_model(MODEL_PATH)

    # 3. Lakukan prediksi massal pada semua data test
    preds = model.predict(X_test, verbose=0)
    
    # Ubah probabilitas menjadi angka kelas (0, 1, 2)
    y_pred = np.argmax(preds, axis=1)

    # 4. Tampilkan Hasil Evaluasi
    target_names = ["Emotional Spender (0)", "Impulsive Spender (1)", "Rational Spender (2)"]

    print("CLASSIFICATION REPORT")
    print(classification_report(y_test, y_pred, target_names=target_names))

    print("CONFUSION MATRIX")
    print(confusion_matrix(y_test, y_pred))

if __name__ == "__main__":
    evaluate_my_model()