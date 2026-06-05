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
- Multer

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
```

## Environment Variables

Backend membaca environment melalui `src/config.ts`.

| Variable                          | Default                 | Keterangan                                  |
| --------------------------------- | ----------------------- | ------------------------------------------- |
| `PORT`                            | `3000`                  | Port HTTP backend                           |
| `APP_URL`                         | `http://localhost:3000` | Base URL backend, dipakai untuk URL upload  |
| `FRONTEND_URL`                    | `http://localhost:5173` | Origin frontend untuk CORS                  |
| `DATABASE_URL`                    | wajib                   | PostgreSQL URL, harus diawali `postgres://` |
| `ML_SERVICE_URL`                  | `http://localhost:8000` | URL FastAPI ML service                      |
| `ML_REQUEST_TIMEOUT_MS`           | `5000`                  | Timeout request ke ML service               |
| `JWT_SECRET`                      | wajib                   | Secret untuk access token                   |
| `ACCESS_TOKEN_EXPIRES_IN_SECONDS` | `900`                   | Masa berlaku access token                   |
| `REFRESH_TOKEN_EXPIRES_IN_DAYS`   | `7`                     | Masa berlaku refresh token                  |
| `REFRESH_COOKIE_SECURE`           | `false`                 | `true` untuk HTTPS/production               |

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

## Seed Demo Persona

Seed demo membuat user dan transaksi demo untuk persona:

```bash
npm run seed:demo-personas
```

Script ini membutuhkan database, kategori system, backend config, dan ML service yang siap jika prediksi dijalankan.

## Endpoint Ringkas

Base prefix API:

```txt
/api/v1
```

Route utama:

| Endpoint                           | Keterangan                       |
| ---------------------------------- | -------------------------------- |
| `GET /health`                      | Health check backend             |
| `POST /api/v1/auth/register`       | Register user                    |
| `POST /api/v1/auth/login`          | Login dan membuat refresh cookie |
| `POST /api/v1/auth/refresh`        | Refresh access token             |
| `POST /api/v1/auth/logout`         | Logout dan revoke refresh token  |
| `GET /api/v1/auth/me`              | Profil user aktif                |
| `PATCH /api/v1/users/me`           | Update profil                    |
| `PATCH /api/v1/users/me/avatar`    | Upload avatar                    |
| `PATCH /api/v1/users/me/password`  | Ubah password                    |
| `GET /api/v1/categories`           | List kategori system             |
| `GET /api/v1/transactions`         | List transaksi                   |
| `POST /api/v1/transactions`        | Buat transaksi                   |
| `GET /api/v1/transactions/summary` | Summary transaksi                |
| `GET /api/v1/transactions/:id`     | Detail transaksi                 |
| `PATCH /api/v1/transactions/:id`   | Update transaksi                 |
| `DELETE /api/v1/transactions/:id`  | Hapus transaksi                  |
| `POST /api/v1/predictions/persona` | Jalankan prediksi persona        |
| `GET /api/v1/predictions/latest`   | Prediksi terbaru                 |
| `GET /api/v1/predictions/history`  | Riwayat prediksi                 |
| `GET /api/v1/analytics/dashboard`  | Data dashboard dan insight       |

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
