# Dokumentasi API SpendBehavior AI
## 1. Persiapan dan Instalasi

Pastikan Python telah terinstal di dalam sistem operasi. Instal seluruh dependensi yang dibutuhkan melalui terminal:

```bash
pip install fastapi uvicorn pydantic numpy tensorflow joblib pandas scikit-learn

```

Sistem juga membutuhkan file berikut di dalam direktori kerja:

* `models/persona_classifier.keras` (Model Deep Learning)
* `models/scaler.pkl` (File standardisasi data)
* `feature_order.json` (File konfigurasi urutan fitur input)
* `data/budu_user_profiles_idr.csv` (Hanya dibutuhkan untuk endpoint testing)

## 2. Menjalankan Server API

Gunakan Uvicorn untuk menjalankan server FastAPI di lingkungan lokal:

```bash
uvicorn main:app --reload

```

Server akan berjalan pada alamat `http://localhost:8000`. Dokumentasi interaktif (Swagger UI) dapat diakses melalui `http://localhost:8000/docs`.

---

## 3. Panduan Integrasi (Backend & Frontend)

Sistem AI ini sangat bergantung pada integritas dan urutan data input. Tim Backend wajib memastikan bahwa data yang dikirim telah melalui proses perhitungan rasio (persentase) untuk kategori pengeluaran, bukan nilai nominal mata uang.

Semua permintaan (Request) harus menggunakan format JSON murni. Tidak diperbolehkan mengirimkan data bertipe teks (String) seperti "Rp10.000" atau nilai kosong (Null). Jika pengguna belum pernah melakukan transaksi pada kategori tertentu, berikan nilai 0 atau 0.0.

---

## 4. Daftar Endpoint

Sistem ini menyediakan tiga endpoint utama yang dapat digunakan oleh aplikasi.

### A. Endpoint Utama: Analisis Lengkap

* URL: `/predict`
* Metode: `POST`
* Fungsi: Menerima data metrik pengguna, mengembalikan hasil klasifikasi persona AI beserta daftar peringatan sistem pakar.

Format Request (Body):

```json
{
  "features": [
    65000.5, 25.0, 0.3, 0.15, 0.1, 0.05, 0.2, 8.0, 0.85, 
    0.4, 0.15, 0.05, 0.2, 0.0, 0.0, 0.1, 0.05, 0.05, 0.0
  ]
}

```

Format Response:

```json
{
  "persona": "Impulsive Spender",
  "confidence": 0.85,
  "probabilities": {
    "emotional": 0.10,
    "impulsive": 0.85,
    "rational": 0.05
  },
  "smart_warnings_system": [
    "Pola terdeteksi: Pengeluaran akhir pekan sangat tinggi (>40%).",
    "Peringatan: Tingkat pengeluaran impulsif melewati ambang batas aman."
  ]
}

```

### B. Endpoint Microservice: Khusus Peringatan (Rule-Based)

* URL: `/analyze-warnings`
* Metode: `POST`
* Fungsi: Hanya menjalankan deteksi anomali keuangan (tanpa menjalankan model Machine Learning). Sangat ringan dan memiliki latensi rendah.

Format Request (Body) sama seperti endpoint `/predict`.

Format Response:

```json
{
  "status": "success",
  "message": "Analisis kebocoran dana selesai",
  "smart_warnings_system": [
    "Peringatan: Fluktuasi nominal transaksi tidak stabil."
  ]
}

```

### C. Endpoint Pengujian (HANYA UNTUK DEBUGGING BIAR GA INPUT FITUR NYA SATU-SATU MANUAL)

* URL: `/test-random`
* Metode: `GET`
* Fungsi: Mengambil satu baris data acak dari dataset CSV internal dan memprosesnya secara otomatis. Digunakan untuk keperluan demonstrasi dan debugging tanpa memerlukan input payload dari klien.

---

## 5. Urutan Fitur Input

Ini adalah aturan paling kritis untuk tim Backend. Array `features` yang dikirim ke endpoint `/predict` maupun `/analyze-warnings` harus berjumlah tepat 19 elemen dan tersusun dengan urutan indeks baku di bawah ini:

Indeks 0 hingga 8 (Metrik Perilaku Keuangan):
0. `avg_txn_idr`: Rata-rata nominal transaksi.
1. `txn_count`: Jumlah total transaksi.
2. `weekend_ratio`: Rasio frekuensi transaksi akhir pekan.
3. `night_ratio`: Rasio frekuensi transaksi malam hari.
4. `above_avg_ratio`: Rasio transaksi dengan nominal di atas rata-rata.
5. `spike_ratio`: Rasio lonjakan pengeluaran mendadak.
6. `impulse_score`: Skor tingkat impulsivitas transaksi.
7. `unique_categories`: Jumlah variasi kategori pengeluaran.
8. `spending_cov`: Koefisien variasi pengeluaran (stabilitas).

Indeks 9 hingga 18 (Rasio Pengeluaran Kategori):
9. `cat_makanan_minuman_ratio`
10. `cat_transportasi_ratio`
11. `cat_kesehatan_kecantik_ratio`
12. `cat_sembako_kebutuhan__ratio`
13. `cat_kesehatan_ratio`
14. `cat_pendidikan_ratio`
15. `cat_belanja_online_ratio`
16. `cat_pulsa_data_ratio`
17. `cat_hiburan_ratio`
18. `cat_fashion_pakaian_ratio`

Urutan fitur harus sesuai dengan file `feature_order.json` dan tidak boleh berubah.

```
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

Jika urutan tidak sesuai, hasil prediksi akan menjadi tidak valid.

---
### Example Request
```
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
  ]
}
Catatan: Fitur kategori harus berbentuk angka desimal (0.0 hingga 1.0) yang merepresentasikan persentase dari total pengeluaran pengguna, bukan total rupiah.
### Important Notes

* `feature_order.json` adalah source of truth untuk urutan fitur
* Frontend wajib mengikuti urutan ini secara konsisten
* Perubahan urutan fitur harus disinkronkan antara:

  * Model training
  * Backend API
  * Frontend input mapping

---

## 6. Pelatihan Model (Tim Data Science)

Dokumentasi ini juga mencakup modul untuk melatih ulang model Deep Learning:

* `preprocessing.py`: Berisi fungsi `load_and_preprocess_data` untuk membaca data, menggabungkan fitur numerik dan rasio kategori, melakukan pemisahan data berlapis (stratified split), dan menyimpan model standardisasi (`StandardScaler`).
* `train_model.py`: Berisi fungsi arsitektur Jaringan Saraf Tiruan `build_persona_model` dengan lapisan Dense dan Dropout, serta fungsi `train_and_save_model` yang dilengkapi dengan callback EarlyStopping dan TensorBoard untuk pemantauan kualitas pelatihan.