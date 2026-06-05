# Backend BUDU

Backend BUDU adalah REST API untuk SpendBehavior Analyzer. Modul ini menangani autentikasi, user profile, kategori, transaksi, prediksi persona, analytics dashboard, upload avatar, dan integrasi ke ML service.

## Tech Stack

- Node.js 24
- TypeScript
- Express 5
- PostgreSQL
- Drizzle ORM
- Zod
- JWT dengan `jsonwebtoken`
- Refresh token via HTTP-only cookie
- Multer untuk upload avatar
- ESLint dan Prettier

## Struktur Folder

```txt
src/
  app.ts                 # Express app dan route mounting
  server.ts              # Entrypoint server
  config.ts              # Validasi environment variable
  db/                    # Koneksi DB dan schema Drizzle
  middlewares/           # Auth, error handler, request logger
  modules/
    analytics/
    auth/
    categories/
    feature-engineering/
    predictions/
    transactions/
    users/
  types/
  utils/
scripts/
  seed-demo-personas.ts
drizzle/
  */migration.sql
docs/
  api/
```

## Environment Variables

Backend membaca environment melalui `src/config.ts`.

| Variable | Default | Keterangan |
| --- | --- | --- |
| `PORT` | `3000` | Port HTTP backend |
| `APP_URL` | `http://localhost:3000` | Base URL backend, dipakai untuk URL upload |
| `FRONTEND_URL` | `http://localhost:5173` | Origin frontend untuk CORS |
| `DATABASE_URL` | wajib | PostgreSQL URL, harus diawali `postgres://` |
| `ML_SERVICE_URL` | `http://localhost:8000` | URL FastAPI ML service |
| `ML_REQUEST_TIMEOUT_MS` | `5000` | Timeout request ke ML service |
| `JWT_SECRET` | wajib | Secret untuk access token |
| `ACCESS_TOKEN_EXPIRES_IN_SECONDS` | `900` | Masa berlaku access token |
| `REFRESH_TOKEN_EXPIRES_IN_DAYS` | `7` | Masa berlaku refresh token |
| `REFRESH_COOKIE_SECURE` | `false` | `true` untuk HTTPS/production |

Contoh lokal:

```env
PORT=3000
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgres://postgres:postgres@localhost:5432/budu
ML_SERVICE_URL=http://localhost:8000
ML_REQUEST_TIMEOUT_MS=5000
JWT_SECRET=replace_with_a_long_random_jwt_secret
ACCESS_TOKEN_EXPIRES_IN_SECONDS=900
REFRESH_TOKEN_EXPIRES_IN_DAYS=7
REFRESH_COOKIE_SECURE=false
```

## Instalasi

Jalankan dari folder `fs/backend`:

```bash
npm install
```

## Menjalankan Lokal

Pastikan PostgreSQL aktif dan `DATABASE_URL` sudah benar.

```bash
npm run drizzle:migrate
npm run dev
```

Server berjalan di:

```txt
http://localhost:3000
```

Health check:

```txt
GET /health
```

## Build dan Start Production

```bash
npm run build
npm start
```

`npm start` menjalankan file build di `dist/src/server.js`.

## Script Penting

| Command | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan server dengan `tsx watch` |
| `npm run build` | Build TypeScript |
| `npm start` | Menjalankan hasil build |
| `npm run lint` | Menjalankan ESLint |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run format` | Format dengan Prettier |
| `npm run check` | Format dan lint fix |
| `npm test` | Menjalankan test Node bawaan |
| `npm run drizzle:generate` | Generate migration Drizzle |
| `npm run drizzle:migrate` | Menjalankan migration |
| `npm run seed:demo-personas` | Seed data demo persona |
| `npm run seed:demo-personas:verify` | Verifikasi data demo persona |

## Database Migration

Migration tersimpan di folder `drizzle/`.

Untuk menjalankan migration lokal:

```bash
npm run drizzle:migrate
```

Untuk generate migration setelah perubahan schema:

```bash
npm run drizzle:generate
```

Catatan: jangan generate migration tanpa perubahan schema yang jelas.

## Seed Demo Persona

Seed demo membuat user dan transaksi demo untuk persona:

```bash
npm run seed:demo-personas
```

Verifikasi tanpa menulis ulang data demo:

```bash
npm run seed:demo-personas:verify
```

Script ini membutuhkan database, kategori system, backend config, dan ML service yang siap jika prediksi dijalankan.

## Endpoint Ringkas

Base prefix API:

```txt
/api/v1
```

Route utama:

| Endpoint | Keterangan |
| --- | --- |
| `GET /health` | Health check backend |
| `POST /api/v1/auth/register` | Register user |
| `POST /api/v1/auth/login` | Login dan membuat refresh cookie |
| `POST /api/v1/auth/refresh` | Refresh access token |
| `POST /api/v1/auth/logout` | Logout dan revoke refresh token |
| `GET /api/v1/auth/me` | Profil user aktif |
| `PATCH /api/v1/users/me` | Update profil |
| `PATCH /api/v1/users/me/avatar` | Upload avatar |
| `PATCH /api/v1/users/me/password` | Ubah password |
| `GET /api/v1/categories` | List kategori system |
| `GET /api/v1/transactions` | List transaksi |
| `POST /api/v1/transactions` | Buat transaksi |
| `GET /api/v1/transactions/summary` | Summary transaksi |
| `GET /api/v1/transactions/:id` | Detail transaksi |
| `PATCH /api/v1/transactions/:id` | Update transaksi |
| `DELETE /api/v1/transactions/:id` | Hapus transaksi |
| `POST /api/v1/predictions/persona` | Jalankan prediksi persona |
| `GET /api/v1/predictions/latest` | Prediksi terbaru |
| `GET /api/v1/predictions/history` | Riwayat prediksi |
| `GET /api/v1/analytics/dashboard` | Data dashboard dan insight |

Dokumentasi API lebih lengkap tersedia di `docs/api/API.md` dan `docs/api/openapi.json`.

## Integrasi ML

Backend adalah satu-satunya service yang memanggil ML service. Frontend tidak memanggil FastAPI langsung.

Alur prediksi:

```txt
Frontend -> Backend -> Feature Engineering -> ML Service -> Backend -> PostgreSQL
```

Backend membangun feature vector dari transaksi tersimpan melalui modul `feature-engineering`, lalu memanggil endpoint ML di `ML_SERVICE_URL`.

## Docker

Backend Dockerfile memiliki stage:

- `deps`
- `build`
- `tools` untuk migration
- `runtime`

Dengan Docker Compose, backend tersedia di:

```txt
http://localhost:3000
```

Migration via Compose:

```bash
docker compose --profile migrate run --rm backend-migrate
```

## Testing dan Lint

```bash
npm test
npm run lint
npm run build
```

Test memakai Node test runner:

```txt
node --import tsx --test src/modules/**/*.test.ts
```

## Troubleshooting

### Env invalid saat startup

`src/config.ts` memvalidasi env dengan Zod. Pastikan `DATABASE_URL` dan `JWT_SECRET` tersedia, serta URL memakai format valid.

### Database error atau tabel tidak ditemukan

Jalankan migration:

```bash
npm run drizzle:migrate
```

Untuk Docker Compose:

```bash
docker compose --profile migrate run --rm backend-migrate
```

### CORS error dari frontend

Pastikan `FRONTEND_URL` sama dengan origin frontend, misalnya:

```env
FRONTEND_URL=http://localhost:5173
```

### Token selalu expired atau login gagal

Pastikan `JWT_SECRET` stabil dan tidak berubah antar restart. Jika memakai cookie secure di lokal HTTP, set:

```env
REFRESH_COOKIE_SECURE=false
```

### Prediksi gagal atau 503

Pastikan ML service aktif dan `ML_SERVICE_URL` benar. Untuk local non-Docker:

```env
ML_SERVICE_URL=http://localhost:8000
```

Untuk Docker Compose:

```env
ML_SERVICE_URL=http://ml:8000
```

### Upload avatar gagal

Pastikan folder upload bisa ditulis oleh proses backend. Di Docker Compose, upload disimpan di volume `backend_uploads`.

## Maintenance Notes

- Ikuti pola route -> controller -> service -> repository.
- Jangan panggil ML service dari frontend.
- Jangan mengubah kontrak `feature_order` tanpa sinkronisasi dengan `ml/feature_order.json`.
- Kategori yang tersedia di route saat ini adalah kategori system lewat `GET /categories`.
- Dokumentasi API harus ikut diperbarui jika route atau payload berubah.
