# SpendBehavior Analyzer / BUDU

SpendBehavior Analyzer, atau **BUDU (Butuh Duit)**, adalah aplikasi web fintech untuk membantu pengguna memahami pola pengeluaran dari sisi perilaku. MVP ini mencakup autentikasi, pencatatan transaksi, riwayat, dashboard, analisis pengeluaran, smart warning, money leak detection, spending persona, dan profil pengguna.

Dokumentasi ini ditujukan untuk developer yang ingin menjalankan, mengintegrasikan, dan merawat project.

## Struktur Project

```txt
.
├── fs/
│   ├── backend/    # Express API, PostgreSQL, Drizzle ORM
│   └── frontend/   # React + Vite frontend
├── ml/             # FastAPI ML service untuk persona dan warning
├── ds/             # Artefak/data science informasional
├── docker-compose.yml
├── .env.example
└── README.md
```

Catatan: tidak ada folder `docs/` di root project saat ini. Dokumentasi backend berada di `fs/backend/docs/`.

## Tech Stack Ringkas

- Backend: Node.js 24, TypeScript, Express 5, PostgreSQL, Drizzle ORM, Zod, JWT.
- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, Lucide React.
- ML service: Python 3.12, FastAPI, Pydantic, TensorFlow/Keras, pandas, numpy, scikit-learn, joblib.
- Infrastruktur lokal: Docker Compose dengan PostgreSQL, backend, frontend, dan ML service.

## Port Lokal

| Service | URL |
| --- | --- |
| Frontend dev | `http://localhost:5173` |
| Frontend Docker | `http://localhost:8080` |
| Backend API | `http://localhost:3000` |
| Backend health | `http://localhost:3000/health` |
| ML service | `http://localhost:8000` |
| PostgreSQL | `127.0.0.1:5432` |

## Environment

Salin contoh environment:

```bash
cp .env.example .env
```

Variabel penting di root `.env`:

```env
POSTGRES_DB=budu
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

PORT=3000
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgres://postgres:postgres@localhost:5432/budu
ML_SERVICE_URL=http://localhost:8000
JWT_SECRET=replace_with_a_long_random_jwt_secret
VITE_API_URL=http://localhost:3000/api/v1
```

Catatan untuk Docker Compose:

- `DATABASE_URL` perlu mengarah ke host service Compose, misalnya `postgres://postgres:postgres@postgres:5432/budu`.
- `ML_SERVICE_URL` perlu mengarah ke `http://ml:8000`.
- `VITE_API_URL` dipakai sebagai build arg frontend Docker.

## Menjalankan Dengan Docker Compose

Pastikan `.env` sudah dibuat dan disesuaikan.

```bash
docker compose up -d --build postgres ml
docker compose --profile migrate run --rm backend-migrate
docker compose up -d --build backend frontend
```

Untuk menjalankan semua service sekaligus:

```bash
docker compose up -d --build
```

Jika database masih kosong, jalankan migration sebelum memakai aplikasi:

```bash
docker compose --profile migrate run --rm backend-migrate
```

Frontend Docker tersedia di `http://localhost:8080`.

## Menjalankan Lokal Tanpa Docker

Jalankan setiap service dari folder masing-masing.

Backend:

```bash
cd fs/backend
npm install
npm run drizzle:migrate
npm run dev
```

Frontend:

```bash
cd fs/frontend
npm install
npm run dev
```

ML service:

```bash
cd ml
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Validasi Umum

Backend:

```bash
cd fs/backend
npm run build
npm run lint
npm test
```

Frontend:

```bash
cd fs/frontend
npm run build
npm run lint
```

ML service:

- Jalankan FastAPI lokal dan buka `http://localhost:8000/docs`.
- Kirim payload ke `POST /predict` sesuai `ml/feature_order.json`.

Catatan: `ml/test_api.py` tersedia sebagai helper lokal, tetapi perlu diverifikasi ulang terhadap kontrak `feature_order.json` sebelum dijadikan validasi utama.

## Dokumentasi Modul

- Backend: `fs/backend/README.md`
- Frontend: `fs/frontend/README.md`
- ML service: `ml/README.md`
- API backend lengkap: `fs/backend/docs/api/API.md`
- OpenAPI backend: `fs/backend/docs/api/openapi.json`

## Maintenance Notes

- Frontend tidak memanggil ML service langsung. Semua prediksi berjalan melalui backend.
- Backend memakai refresh token dalam HTTP-only cookie dan access token di sisi frontend.
- `ml/feature_order.json` adalah source of truth untuk urutan fitur ML.
- Folder `ds/` berisi artefak data science dan tidak menjadi kontrak production utama.
