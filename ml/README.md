# ML Service BUDU

ML service BUDU adalah FastAPI service untuk klasifikasi spending persona, smart warning, dan money leak detection. Service ini dipakai oleh backend Node.js. Frontend tidak memanggil service ML secara langsung.

## Tech Stack

- Python 3.12 pada Docker image `python:3.12-slim`
- FastAPI
- Pydantic
- TensorFlow/Keras
- pandas
- numpy
- scikit-learn
- joblib
- TensorBoard untuk log training

## Struktur Folder

```txt
ml/
  app/
    main.py                 # FastAPI app
  src/
    data_clean/
      preprocessing.py      # Preprocessing dan scaler
    models/
      rules.py              # Rule-based warning dan money leak
      train_model.py        # Definisi dan training model
  data/
    budu_user_profiles_idr.csv
    budu_transactions_clean_idr.csv
    budu_model_metadata.json
    budu_dummy_users.csv
  models/
    persona_classifier.keras
    scaler.pkl
  feature_order.json
  run_pipeline.py
  evaluasi_model.py
  test_api.py
  requirements.txt
  Dockerfile
  Makefile
```

## Artefak Wajib

Service membutuhkan file berikut saat startup:

- `models/persona_classifier.keras`
- `models/scaler.pkl`
- `feature_order.json`

Untuk endpoint debug `/test-random`, service juga membutuhkan:

- `data/budu_user_profiles_idr.csv`

Jika model atau scaler gagal dimuat, endpoint prediksi dapat mengembalikan `503`.

## Install Dependency Lokal

Jalankan dari folder `ml`:

```bash
pip install -r requirements.txt
```

Disarankan memakai virtual environment:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Untuk shell Unix:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Menjalankan Lokal

Jalankan dari folder `ml`:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Atau gunakan Makefile:

```bash
make run
```

Service tersedia di:

```txt
http://localhost:8000
```

Swagger UI tersedia di:

```txt
http://localhost:8000/docs
```

## Menjalankan Dengan Docker

Build dan run manual:

```bash
docker build -t budu-ml .
docker run --rm -p 8000:8000 budu-ml
```

Dalam root Docker Compose, service `ml` dibangun dari folder `./ml` dan diekspos ke host:

```txt
127.0.0.1:8000:8000
```

## Endpoint

### `POST /predict`

Menjalankan prediksi persona, smart warning, dan money leak detection.

Request:

```json
{
  "features": [
    100000,
    25,
    0.3,
    0.2,
    0.5,
    0.1,
    0.2,
    5,
    0.6,
    0.2,
    0.1,
    0.05,
    0.1,
    0.05,
    0.02,
    0.1,
    0.08,
    0.05,
    0.15
  ],
  "transactions": [
    {
      "txn_id": "txn-1",
      "type": "expense",
      "category_id": "category-1",
      "category": "Makanan & Minuman",
      "amount": 45000,
      "transaction_date": "2026-06-01T12:00:00.000Z"
    }
  ]
}
```

`transactions` bersifat optional dan default-nya list kosong. Data ini dipakai untuk money leak detection.

Response ringkas:

```json
{
  "persona": "Impulsive Spender",
  "confidence": 0.85,
  "probabilities": {
    "emotional": 0.1,
    "impulsive": 0.85,
    "rational": 0.05
  },
  "smart_warnings_system": [
    {
      "code": "impulse_score_high",
      "title": "Pola Impulsif Terdeteksi",
      "message": "Peringatan: Tingkat pengeluaran impulsif melewati ambang batas aman.",
      "label": "Impulsif",
      "severity": "danger"
    }
  ],
  "money_leaks": []
}
```

### `POST /analyze-warnings`

Menjalankan rule-based warning dan money leak tanpa klasifikasi persona dari model.

Request body sama seperti `/predict`.

Response:

```json
{
  "status": "success",
  "message": "Analisis kebocoran dana selesai",
  "smart_warnings_system": [],
  "money_leaks": []
}
```

### `GET /test-random`

Endpoint debug/demo untuk mengambil satu user acak dari `data/budu_user_profiles_idr.csv`, lalu menjalankan prediksi.

Catatan:

- Endpoint ini hanya untuk debugging/demo.
- Jangan expose endpoint ini sebagai fitur frontend production.

## Kontrak Feature Order

`feature_order.json` adalah source of truth untuk urutan feature vector. Backend harus mengirim `features` dalam urutan yang sama.

Urutan saat ini:

```txt
1. avg_txn_idr
2. txn_count
3. weekend_ratio
4. night_ratio
5. above_avg_ratio
6. spike_ratio
7. impulse_score
8. unique_categories
9. spending_cov
10. cat_makanan_minuman_ratio
11. cat_transportasi_ratio
12. cat_kesehatan_kecantik_ratio
13. cat_sembako_kebutuhan__ratio
14. cat_kesehatan_ratio
15. cat_pendidikan_ratio
16. cat_belanja_online_ratio
17. cat_pulsa_data_ratio
18. cat_hiburan_ratio
19. cat_fashion_pakaian_ratio
```

Jika urutan berubah, sinkronkan:

- `ml/feature_order.json`
- backend `feature-engineering`
- model training
- dokumentasi API

## Integrasi Dengan Backend

Backend Node.js memanggil ML service melalui `ML_SERVICE_URL`.

Alur production:

```txt
Frontend -> Backend -> Feature Engineering -> ML Service -> Backend -> PostgreSQL
```

Frontend tidak mengirim feature vector dan tidak memanggil FastAPI langsung. Backend membangun feature vector dari transaksi yang tersimpan.

## Training Model

Jalankan dari folder `ml`:

```bash
python run_pipeline.py
```

Pipeline ini:

- membaca `data/budu_user_profiles_idr.csv`
- membaca urutan fitur dari `feature_order.json`
- membuat train/validation/test split
- menyimpan scaler ke `models/scaler.pkl`
- melatih model
- menyimpan model ke `models/persona_classifier.keras`
- menulis log TensorBoard ke `logs/tensorboard/`

## Evaluasi Model

```bash
python evaluasi_model.py
```

Script ini memuat model dan menampilkan classification report serta confusion matrix.

Catatan: script evaluasi memakai preprocessing yang juga menulis scaler ke path yang diberikan.

## Test API Lokal

```bash
python test_api.py
```

Catatan:

- ML service harus sudah berjalan di `http://127.0.0.1:8000`.
- Script ini adalah helper lokal, bukan test suite production formal.
- Perlu dikonfirmasi: sebelum dipakai sebagai validasi utama, pastikan payload di script ini sudah sama dengan `feature_order.json` terbaru.

## Troubleshooting

### `503 Model AI belum siap`

Pastikan file berikut ada dan bisa dibaca:

```txt
models/persona_classifier.keras
models/scaler.pkl
```

### Jumlah fitur salah

Pastikan panjang `features` sama dengan jumlah item di `feature_order.json`.

### Import module gagal

Jalankan command dari folder `ml`, bukan dari root:

```bash
cd ml
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### TensorFlow lambat saat startup

Model dimuat saat aplikasi start. Startup pertama bisa memakan waktu lebih lama, terutama di mesin tanpa akselerasi.

## Maintenance Notes

- Jangan ubah `feature_order.json` tanpa koordinasi dengan backend.
- Jangan hapus `models/persona_classifier.keras` atau `models/scaler.pkl` dari runtime image.
- Endpoint `/test-random` hanya untuk debugging.
- Rule warning dan money leak berada di `src/models/rules.py`.
- Training dapat menghasilkan file log di `logs/tensorboard/`.
