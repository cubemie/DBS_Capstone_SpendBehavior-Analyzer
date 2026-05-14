Ini adalah draf `README.md` yang profesional dan lengkap, dirancang khusus untuk merepresentasikan proyek **BUDU — SpendBehavior Analyzer** di repositori GitHub kamu.

Draf ini mencakup penjelasan alur *Data Science*, teknologi yang digunakan, hingga panduan instalasi.

---

# 💸 BUDU — SpendBehavior Analyzer

### Data Science Pipeline & Behavioral Insights Dashboard

**Coding Camp 2026 – DBS Foundation | Tim CC26-PSU268**

---

## 📌 Deskripsi Proyek

**BUDU** adalah sistem penganalisis perilaku pengeluaran (*SpendBehavior*) yang dirancang untuk membantu pengguna memahami kebiasaan finansial mereka melalui pendekatan *Data Science*. Proyek ini mencakup alur pemrosesan data *end-to-end*, mulai dari pembuatan dataset sintetis yang realistis (IDR Edition), analisis statistik mendalam, hingga pengelompokan persona pengguna menggunakan Machine Learning.

## 🚀 Fitur Utama

* **6 SMART Business Questions:** Menjawab tantangan bisnis kritis seperti deteksi *money leak*, anomali bulanan, dan pola pengeluaran akhir pekan.
* **A/B Testing:** Validasi statistik menggunakan uji *Mann-Whitney U* untuk membandingkan perilaku belanja *weekday* vs *weekend*.
* **User Segmentation:** Pengelompokan 1.000 user ke dalam 4 persona belanja menggunakan algoritma *K-Means Clustering*.
* **Interactive Dashboard:** Visualisasi data real-time menggunakan Streamlit dan Plotly.

## 🛠️ Pipeline Data Science (14 Tahapan)

Analisis ini mengikuti alur kerja yang ketat untuk memastikan integritas data:

1. **Setup:** Konfigurasi library & lingkungan global.
2. **Dataset Dummy:** Generasi data transaksi Indonesia yang realistis.
3. **Assessing:** Evaluasi kualitas dan struktur data mentah.
4. **Cleaning:** Data wrangling *end-to-end* (Zero Null Policy).
5. **Business Questions:** Definisi 6 pertanyaan SMART dalam konteks IDR.
6. **EDA:** Analisis eksploratif untuk menjawab Q1–Q6.
7. **A/B Testing:** Implementasi uji statistik non-parametrik.
8. **Feature Engineering:** Ekstraksi 22+ fitur level transaksi dan user.
9. **Clustering:** Penentuan K optimal (Elbow & Silhouette Score).
10. **Persiapan Model:** Encoding, normalisasi, dan data splitting (70/15/15).
11. **Export:** Output data bersih ke format `.csv`, `.npy`, dan metadata `.json`.
12. **Data Dictionary:** Dokumentasi lengkap setiap fitur yang dihasilkan.

## 👥 Spending Personas

Berdasarkan hasil clustering, pengguna dibagi menjadi 4 kelompok:

* **Conservative Saver:** Hemat, rasio pengeluaran rendah, jarang impulsif.
* **Balanced Spender:** Terencana, pengeluaran stabil dan terdiversifikasi.
* **Active Consumer:** Transaksi tinggi, berorientasi gaya hidup, masyarakat urban.
* **Impulsive Spender:** Tingkat impulsivitas tinggi, sering belanja di malam hari & akhir pekan.

## 💻 Cara Menjalankan Dashboard

1. **Clone Repositori:**
```bash
git clone https://github.com/username-kamu/nama-repo.git
cd "CAPSTONE_Spendbehavior"

```


2. **Install Dependensi:**
```bash
pip install streamlit pandas numpy plotly scipy scikit-learn

```


3. **Jalankan Aplikasi:**
```bash

python -m streamlit run dashboard_app.py


```



## 📂 Struktur File Utama

* `BUDU_DS_FINAL.ipynb`: Notebook utama berisi seluruh pipeline DS.
* `dashboard_app.py`: Aplikasi Streamlit untuk visualisasi interaktif.
* `budu_transactions_clean_idr.csv`: Dataset transaksi hasil pembersihan.
* `budu_user_profiles_idr.csv`: Profil user lengkap dengan label persona.

---

**Tim CC26-PSU268**
*Capstone Project - Coding Camp 2026*