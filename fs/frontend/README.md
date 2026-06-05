# Frontend BUDU

Frontend BUDU adalah aplikasi React untuk SpendBehavior Analyzer. Aplikasi ini menyediakan halaman login, register, dashboard, riwayat transaksi, tambah/edit transaksi, analisis, peringatan, dan profil pengguna.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React
- Fetch wrapper internal di `src/services/apiClient.ts`

Catatan: `axios` ada di dependency package, tetapi integrasi API saat ini memakai fetch wrapper.

## Struktur Folder

```txt
src/
  assets/       # Logo/asset visual
  components/   # Komponen reusable
  contexts/     # AuthContext
  hooks/        # Hook reusable seperti useApi dan usePredictionRefresh
  layout/       # AppLayout, AuthLayout, Sidebar, TopBar, BottomNav
  lib/          # Utilitas/icon helper lama
  pages/        # Halaman route utama
  services/     # Integrasi API backend
  styles/       # CSS global/Tailwind
  types/        # TypeScript model
  utils/        # Formatter, cn, navigasi
```

## Environment Variable

Buat file `.env` atau `.env.local` di `fs/frontend/` jika menjalankan frontend secara lokal:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

Default lokal backend adalah `http://localhost:3000/api/v1`.

Untuk Docker Compose, `VITE_API_URL` dibaca dari root `.env` dan dikirim sebagai build arg di `docker-compose.yml`.

## Instalasi

Jalankan dari folder `fs/frontend`:

```bash
npm install
```

## Menjalankan Lokal

```bash
npm run dev
```

Vite berjalan di `http://localhost:5173`.

Pastikan backend aktif di URL yang sama dengan `VITE_API_URL`.

## Build dan Preview

```bash
npm run build
npm run preview
```

`npm run build` menjalankan TypeScript build (`tsc -b`) dan Vite build.

## Script Penting

| Command | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan Vite dev server |
| `npm run build` | Type-check dan build production |
| `npm run preview` | Preview hasil build Vite |
| `npm run lint` | Menjalankan ESLint |
| `npm run lint:fix` | Menjalankan ESLint dengan auto-fix |
| `npm run format` | Format kode dengan Prettier |
| `npm run check` | Menjalankan format dan lint fix |

## Route Aplikasi

| Route | Halaman |
| --- | --- |
| `/` | Login |
| `/daftar` | Register |
| `/dashboard` | Dashboard |
| `/analisis` | Analisis |
| `/riwayat` | Riwayat transaksi |
| `/peringatan` | Peringatan dan money leak |
| `/profil` | Profil pengguna |
| `/tambah` | Tambah transaksi |
| `/transaksi/:id/edit` | Edit transaksi |

Protected route dibungkus oleh `PrivateRoute` dan `AppLayout`.

## Integrasi API

Semua request backend lewat service di `src/services/`:

- `authService.ts`
- `categoryService.ts`
- `transactionService.ts`
- `analyticsService.ts`
- `predictionService.ts`
- `apiClient.ts`

`apiClient.ts` bertanggung jawab untuk:

- membaca `VITE_API_URL`
- mengirim `Authorization: Bearer <accessToken>`
- mengirim cookie dengan `credentials: "include"`
- refresh access token saat response `401`
- redirect ke `/` jika session tidak bisa dipulihkan

## Alur Auth

- Login memanggil `/auth/login`, menyimpan access token di module-level `tokenStore`, lalu mengambil user dari `/auth/me`.
- Refresh token disimpan backend sebagai HTTP-only cookie.
- Saat app mount, `AuthProvider` mencoba restore session lewat `/auth/refresh`.
- Logout memanggil `/auth/logout`, lalu membersihkan token dan user state.

Access token tidak disimpan di `localStorage`.

## Data Fetching

Halaman memakai hook sederhana:

- `useApi` untuk loading, error, data, dan refetch.
- `usePredictionRefresh` untuk menjalankan ulang prediksi persona dan memperbarui dashboard/peringatan/profil.

Belum ada React Query di MVP ini.

## Docker

Frontend memiliki Dockerfile multi-stage:

- build dengan Node 24 Alpine
- runtime dengan Nginx 1.29 Alpine

Dalam Docker Compose, frontend tersedia di:

```txt
http://localhost:8080
```

Build arg:

```txt
VITE_API_URL
```

## Troubleshooting

### Halaman redirect ke login terus

Kemungkinan refresh token cookie tidak terkirim atau backend mengembalikan `401`. Pastikan:

- backend aktif
- `VITE_API_URL` benar
- `FRONTEND_URL` di backend sesuai origin frontend
- request auth memakai cookie dari domain/port yang benar

### Request API gagal

Cek `VITE_API_URL`. Untuk local dev biasanya:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

### Build gagal

Jalankan:

```bash
npm run lint
npm run build
```

Perbaiki error TypeScript atau import yang tidak digunakan.

### Dashboard/persona kosong

Tambahkan transaksi terlebih dahulu, lalu jalankan analisis dari kartu status prediksi. Jika ML service tidak aktif, backend dapat mengembalikan error analisis.

## Maintenance Notes

- Jangan hardcode URL backend di service. Gunakan `VITE_API_URL`.
- Mapping DTO backend ke model UI dilakukan di service, bukan di JSX kecil.
- Untuk perubahan route baru, update `src/App.tsx`, navigasi, dan README ini.
- Frontend tidak boleh memanggil ML service langsung.
