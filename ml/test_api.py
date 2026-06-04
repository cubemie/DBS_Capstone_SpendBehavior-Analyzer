import pandas as pd
import requests

REQUIRED_WARNING_FIELDS = {"code", "title", "message", "label", "severity"}


def validate_warning_shape(response_body):
    warnings = response_body.get("smart_warnings_system", [])

    if not isinstance(warnings, list):
        raise AssertionError("smart_warnings_system harus berupa list")

    for warning in warnings:
        if not isinstance(warning, dict):
            raise AssertionError("Setiap smart warning harus berupa object")

        missing_fields = REQUIRED_WARNING_FIELDS - set(warning)
        if missing_fields:
            raise AssertionError(f"Smart warning kurang field: {sorted(missing_fields)}")


def test_api_random():
    # 1. Baca data asli
    df = pd.read_csv("data/budu_user_profiles_idr.csv")
    
    # 2. Ambil 1 user secara ACAK (Random) dari seluruh dataset
    random_user = df.sample(n=1).iloc[0]
    
    print(f"=== TARGET PENGUJIAN ===")
    print(f"User ID       : {random_user['user_id']}")
    print(f"Label Asli CSV: {random_user['spending_persona']} (Kode: {random_user['persona_encoded']})")

    # 3. Urutan fitur (Wajib sama persis dengan preprocessing)
    feature_cols = [
        'total_spending_idr', 'avg_txn_idr', 'median_txn_idr', 'max_txn_idr', 
        'txn_count', 'std_amount_idr', 'weekend_ratio', 'night_ratio', 
        'month_start_ratio', 'month_end_ratio', 'above_avg_ratio', 'spike_ratio', 
        'impulse_score', 'unique_categories', 'unique_merchants', 'active_months', 
        'spending_cov', 'avg_dist_merchant'
    ]
    cat_cols = [col for col in df.columns if col.startswith('cat_')]
    feature_cols.extend(cat_cols)

    # 4. Ubah baris data tersebut menjadi list/array
    # 4. Ubah baris data tersebut menjadi list/array dan paksa menjadi float standar
    features_array = random_user[feature_cols].fillna(0).astype(float).values.tolist()

    # 5. Tembak ke API FastAPI
    url = "http://127.0.0.1:8000/predict"
    payload = {"features": features_array}
    
    print("\nMengirim data ke API...")
    response = requests.post(url, json=payload)
    
    print("\n=== HASIL PREDIKSI AI ===")
    response_body = response.json()
    validate_warning_shape(response_body)
    print(response_body)

if __name__ == "__main__":
    test_api_random()
