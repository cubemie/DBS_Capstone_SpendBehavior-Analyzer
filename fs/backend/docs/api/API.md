# SpendBehavior Analyzer Backend API

This document covers the backend endpoints currently mounted by `src/app.ts`.

Base URL for local development:

```text
http://localhost:3000
```

API version prefix:

```text
/api/v1
```

OpenAPI JSON:

```text
docs/api/openapi.json
```

## Authentication

The API uses short-lived JWT access tokens and an HTTP-only refresh token cookie.

1. Register a new user if needed, then login.
2. Store the `accessToken` returned by login or refresh in frontend auth state.
3. Send protected requests with:

```http
Authorization: Bearer <accessToken>
```

4. Refresh the access token by calling `POST /api/v1/auth/refresh` with browser credentials/cookies enabled.
5. Logout with `POST /api/v1/auth/logout`.

Refresh token cookie details from the backend:

- Cookie name: `refresh_token`
- `httpOnly: true`
- `sameSite: lax`
- Path: `/api/v1/auth`
- Secure flag follows `REFRESH_COOKIE_SECURE`

Frontend fetch/axios calls to `/auth/refresh` and `/auth/logout` should include credentials so the cookie is sent.

## Error Format

Most application errors:

```json
{
  "message": "Kategori tidak ditemukan"
}
```

Validation errors:

```json
{
  "message": "Validasi gagal",
  "details": [
    {
      "field": "email",
      "message": "Harus merupakan email yang valid"
    }
  ]
}
```

Unhandled server errors:

```json
{
  "message": "Terjadi kesalahan pada server"
}
```

## Conventions

Dates are ISO datetimes with timezone offsets in request bodies and query params:

```text
2026-06-02T12:00:00+07:00
```

Paginated endpoints return:

```json
{
  "items": [],
  "page": 1,
  "limit": 20,
  "total": 0
}
```

Pagination query params:

- `page`: positive integer, default `1`
- `limit`: positive integer, max `100`, default `20`

Date range query params:

- `from`: inclusive ISO datetime with offset
- `to`: inclusive ISO datetime with offset
- If both are provided, `from` must be earlier than or equal to `to`

Money fields are integer IDR amounts, for example `35000`.

## Health

### `GET /`

Auth: public

Returns API metadata and process uptime:

```json
{
  "status": "ok",
  "name": "SpendBehavior Analyzer API",
  "version": "1.0.0",
  "uptime": 123,
  "endpoints": {
    "auth": "/api/v1/auth",
    "users": "/api/v1/users",
    "categories": "/api/v1/categories",
    "transactions": "/api/v1/transactions",
    "predictions": "/api/v1/predictions",
    "analytics": "/api/v1/analytics"
  }
}
```

### `GET /health`

Auth: public

Returns a minimal health response:

```json
{
  "status": "ok",
  "uptime": 123.45
}
```

## Auth

### `POST /api/v1/auth/register`

Auth: public

Creates a user and returns the created user.

This endpoint does not start a refresh-token session and does not return an access token. Call `POST /api/v1/auth/login` after registration to receive tokens.

Request body:

```json
{
  "fullName": "Makise Kurisu",
  "email": "makise@amadeus.com",
  "password": "supersecretpassword",
  "avatarUrl": "https://example.com/avatar.png",
  "phone": "+6281234567890"
}
```

Required fields: `fullName`, `email`, `password`.

Response `201`:

```json
{
  "user": {
    "id": "018f2e90-3b95-7c83-a996-2b89420f0342",
    "fullName": "Makise Kurisu",
    "email": "makise@amadeus.com",
    "avatarUrl": null,
    "phone": null,
    "locale": "id-ID",
    "timezone": "Asia/Jakarta",
    "persona": null,
    "updatedAt": "2026-06-03T04:20:00.000Z",
    "createdAt": "2026-06-03T04:20:00.000Z"
  }
}
```

Common errors: `400` validation, `409` email already registered, `429` too many auth attempts, `500` server error.

### `POST /api/v1/auth/login`

Auth: public

Authenticates credentials, starts a refresh-token session, sets the `refresh_token` cookie, and returns an access token.

Request body:

```json
{
  "email": "makise@amadeus.com",
  "password": "supersecretpassword"
}
```

Response `200`:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Common errors: `400` validation, `401` wrong email/password, `429` too many auth attempts, `500` server error.

### `POST /api/v1/auth/refresh`

Auth: refresh cookie

Rotates the refresh token and returns a new access token.

Request body: none.

Response `200`:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Common errors: `401` missing/invalid refresh token, `500` server error.

### `POST /api/v1/auth/logout`

Auth: refresh cookie

Revokes the active refresh token when present and clears the cookie.

Request body: none.

Response `204`: no body.

### `GET /api/v1/auth/me`

Auth: Bearer access token required

Returns the authenticated user profile.

Response `200`:

```json
{
  "id": "018f2e90-3b95-7c83-a996-2b89420f0342",
  "fullName": "Makise Kurisu",
  "email": "makise@amadeus.com",
  "avatarUrl": null,
  "phone": null,
  "locale": "id-ID",
  "timezone": "Asia/Jakarta",
  "persona": "rational",
  "updatedAt": "2026-06-03T04:20:00.000Z",
  "createdAt": "2026-06-03T04:20:00.000Z"
}
```

Common errors: `401` missing/invalid access token, `404` user not found, `500` server error.

## Users

All user endpoints require a Bearer access token and operate only on the authenticated user. User registration and current-profile reads stay under `/api/v1/auth`.

### `PATCH /api/v1/users/me`

Updates the authenticated user's profile fields.

Request body can include:

```json
{
  "fullName": "Makise Kurisu",
  "phone": "+6281234567890"
}
```

Editable fields: `fullName`, `phone`.

Response `200`:

```json
{
  "id": "018f2e90-3b95-7c83-a996-2b89420f0342",
  "fullName": "Makise Kurisu",
  "email": "makise@amadeus.com",
  "avatarUrl": null,
  "phone": "+6281234567890",
  "locale": "id-ID",
  "timezone": "Asia/Jakarta",
  "persona": null,
  "updatedAt": "2026-06-03T04:25:00.000Z",
  "createdAt": "2026-06-03T04:20:00.000Z"
}
```

Common errors: `400` validation, `401` missing/invalid access token, `404` user not found, `500` server error.

### `PATCH /api/v1/users/me/password`

Changes the authenticated user's password after validating the old password.

Request body:

```json
{
  "oldPassword": "supersecretpassword",
  "newPassword": "newsecretpassword"
}
```

Response `200`:

```json
{
  "success": true
}
```

Common errors: `400` validation or wrong old password, `401` missing/invalid access token, `404` user not found, `500` server error.

## Categories

All category endpoints require a Bearer access token.

Category kind values:

```text
income | expense
```

### `GET /api/v1/categories`

Returns system categories plus the authenticated user's custom categories.

Query params:

- `kind`: optional `income` or `expense`

Response `200`:

```json
[
  {
    "id": "018f2e90-49b4-7a0d-a3f7-9b77d3f52a45",
    "userId": null,
    "name": "Makanan & Minuman",
    "slug": "makanan-and-minuman",
    "kind": "expense",
    "mlKey": "food_beverage",
    "color": "#F97316",
    "icon": "utensils",
    "isSystem": true,
    "updatedAt": "2026-06-03T04:20:00.000Z",
    "createdAt": "2026-06-03T04:20:00.000Z"
  }
]
```

### `POST /api/v1/categories`

Creates a custom category. The backend generates `slug` from `name`.

Request body:

```json
{
  "name": "Kopi",
  "kind": "expense",
  "color": "#8B5CF6",
  "icon": "coffee"
}
```

Required fields: `name`, `kind`.

Response `201`: category object.

Common errors: `400` validation, `401` unauthorized, `409` duplicate category.

### `PATCH /api/v1/categories/{id}`

Updates a user-owned category. System categories cannot be updated.

Path params:

- `id`: category UUID

Request body must include at least one field:

```json
{
  "name": "Kopi Harian",
  "color": "#14B8A6",
  "icon": "coffee"
}
```

Response `200`: category object.

Common errors: `400` validation, `401` unauthorized, `403` system category, `404` not found, `409` duplicate category.

### `DELETE /api/v1/categories/{id}`

Deletes a user-owned category. System categories and categories already used by transactions cannot be deleted.

Path params:

- `id`: category UUID

Response `204`: no body.

Common errors: `400` validation, `401` unauthorized, `403` system category, `404` not found, `409` category is used.

## Transactions

All transaction endpoints require a Bearer access token.

Transaction type values:

```text
income | expense
```

Transaction source currently returned by the backend:

```text
manual
```

### `GET /api/v1/transactions`

Lists transactions for the authenticated user.

Query params:

- `page`: default `1`
- `limit`: default `20`, max `100`
- `from`: optional inclusive ISO datetime
- `to`: optional inclusive ISO datetime
- `categoryId`: optional category UUID
- `type`: optional `income` or `expense`
- `search`: optional text, searches title, merchant name, and notes
- `sort`: `date_desc` or `date_asc`, default `date_desc`

Example:

```http
GET /api/v1/transactions?page=1&limit=20&sort=date_desc
```

Response `200`:

```json
{
  "items": [
    {
      "id": "018f2e91-11d2-795a-bf4c-32a95bbd5b19",
      "userId": "018f2e90-3b95-7c83-a996-2b89420f0342",
      "categoryId": "018f2e90-49b4-7a0d-a3f7-9b77d3f52a45",
      "title": "Makan siang",
      "merchantName": "Warung Nasi",
      "paymentMethod": "qris",
      "type": "expense",
      "amountIdr": 35000,
      "transactionDate": "2026-06-02T05:00:00.000Z",
      "notes": "Manual entry",
      "source": "manual",
      "updatedAt": "2026-06-02T05:10:00.000Z",
      "createdAt": "2026-06-02T05:10:00.000Z",
      "category": {
        "id": "018f2e90-49b4-7a0d-a3f7-9b77d3f52a45",
        "userId": null,
        "name": "Makanan & Minuman",
        "slug": "makanan-and-minuman",
        "kind": "expense",
        "mlKey": "food_beverage",
        "color": "#F97316",
        "icon": "utensils",
        "isSystem": true,
        "updatedAt": "2026-06-03T04:20:00.000Z",
        "createdAt": "2026-06-03T04:20:00.000Z"
      }
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 1
}
```

### `POST /api/v1/transactions`

Creates a manual transaction. The selected category must be visible to the user and its `kind` must match the transaction `type`.

Request body:

```json
{
  "categoryId": "018f2e90-49b4-7a0d-a3f7-9b77d3f52a45",
  "title": "Makan siang",
  "merchantName": "Warung Nasi",
  "paymentMethod": "qris",
  "type": "expense",
  "amountIdr": 35000,
  "transactionDate": "2026-06-02T12:00:00+07:00",
  "notes": "Manual entry"
}
```

Required fields: `categoryId`, `title`, `type`, `amountIdr`, `transactionDate`.

Response `201`: transaction object with joined `category`.

Common errors: `400` validation, `401` unauthorized, `404` category not found, `422` category kind mismatch.

### `GET /api/v1/transactions/summary`

Returns income, expense, net total, and transaction count.

Query params:

- `from`: optional inclusive ISO datetime
- `to`: optional inclusive ISO datetime

Example:

```http
GET /api/v1/transactions/summary?from=2026-06-01T00:00:00+07:00&to=2026-06-30T23:59:59+07:00
```

Response `200`:

```json
{
  "incomeTotalIdr": 8000000,
  "expenseTotalIdr": 3500000,
  "netTotalIdr": 4500000,
  "transactionCount": 42
}
```

### `GET /api/v1/transactions/{id}`

Path params:

- `id`: transaction UUID

Response `200`: transaction object with joined `category`.

Common errors: `400` validation, `401` unauthorized, `404` transaction not found.

### `PATCH /api/v1/transactions/{id}`

Updates a transaction. Body must include at least one transaction field.

Path params:

- `id`: transaction UUID

Request body:

```json
{
  "title": "Makan siang kantor",
  "amountIdr": 42000,
  "notes": "Updated receipt"
}
```

Editable fields: `categoryId`, `title`, `merchantName`, `paymentMethod`, `type`, `amountIdr`, `transactionDate`, `notes`.

Response `200`: transaction object with joined `category`.

Common errors: `400` validation, `401` unauthorized, `404` transaction/category not found, `422` category kind mismatch.

### `DELETE /api/v1/transactions/{id}`

Path params:

- `id`: transaction UUID

Response `204`: no body.

Common errors: `400` validation, `401` unauthorized, `404` transaction not found.

## Predictions

All prediction endpoints require a Bearer access token.

Prediction creation uses stored transactions. The frontend does not send the ML feature vector.

### `POST /api/v1/predictions/persona`

Builds feature values from the authenticated user's stored expense transactions, calls the ML service unless a cached prediction exists, persists the result, and returns it.

Request body is optional:

```json
{
  "from": "2026-06-01T00:00:00+07:00",
  "to": "2026-06-30T23:59:59+07:00",
  "timezone": "Asia/Jakarta",
  "force": false
}
```

Defaults:

- `timezone`: `Asia/Jakarta`
- `force`: `false`

Response `201` when a new prediction is created, or `200` when a cached prediction is returned:

```json
{
  "id": "018f2e92-3040-70e2-9a62-bfb5cba94f2d",
  "userId": "018f2e90-3b95-7c83-a996-2b89420f0342",
  "periodFrom": "2026-06-01T00:00:00.000Z",
  "periodTo": "2026-06-30T16:59:59.000Z",
  "timezone": "Asia/Jakarta",
  "persona": "rational",
  "confidence": 0.87,
  "probabilities": {
    "emotional": 0.05,
    "impulsive": 0.08,
    "rational": 0.87
  },
  "warnings": ["Pola pengeluaran stabil"],
  "featureOrder": [
    "avg_txn_idr",
    "txn_count",
    "weekend_ratio",
    "night_ratio",
    "above_avg_ratio",
    "spike_ratio",
    "impulse_score",
    "unique_categories",
    "spending_cov",
    "cat_makanan_minuman_ratio",
    "cat_transportasi_ratio",
    "cat_kesehatan_kecantik_ratio",
    "cat_sembako_kebutuhan__ratio",
    "cat_kesehatan_ratio",
    "cat_pendidikan_ratio",
    "cat_belanja_online_ratio",
    "cat_pulsa_data_ratio",
    "cat_hiburan_ratio",
    "cat_fashion_pakaian_ratio"
  ],
  "features": {
    "avg_txn_idr": 83333.3333,
    "txn_count": 42,
    "weekend_ratio": 0.2857,
    "night_ratio": 0.119,
    "above_avg_ratio": 0.381,
    "spike_ratio": 0.0476,
    "impulse_score": 0.2119,
    "unique_categories": 7,
    "spending_cov": 0.6421,
    "cat_makanan_minuman_ratio": 0.32,
    "cat_transportasi_ratio": 0.14,
    "cat_kesehatan_kecantik_ratio": 0.04,
    "cat_sembako_kebutuhan__ratio": 0.12,
    "cat_kesehatan_ratio": 0.03,
    "cat_pendidikan_ratio": 0.06,
    "cat_belanja_online_ratio": 0.13,
    "cat_pulsa_data_ratio": 0.05,
    "cat_hiburan_ratio": 0.08,
    "cat_fashion_pakaian_ratio": 0.03
  },
  "featureVectorHash": "ee91d2e6e33d4f2f7b0c0c0b1c2a31b2e9b6d45fe2b4e3a9bf6b2d48fd6f43b0",
  "transactionCount": 42,
  "mlResponse": {
    "persona": "rational",
    "confidence": 0.87,
    "probabilities": {
      "emotional": 0.05,
      "impulsive": 0.08,
      "rational": 0.87
    },
    "smart_warnings_system": ["Pola pengeluaran stabil"]
  },
  "createdAt": "2026-06-03T04:20:00.000Z",
  "cached": false
}
```

Common errors: `400` validation, `401` unauthorized, `422` ML rejected generated features, `503` ML unavailable/timeout.

### `GET /api/v1/predictions/latest`

Returns the latest persisted prediction for the authenticated user.

Response `200`: prediction object without `cached`.

Common errors: `401` unauthorized, `404` no prediction exists.

### `GET /api/v1/predictions/history`

Lists persisted predictions. Date filters apply to prediction creation time.

Query params:

- `page`: default `1`
- `limit`: default `20`, max `100`
- `from`: optional inclusive ISO datetime
- `to`: optional inclusive ISO datetime

Response `200`:

```json
{
  "items": [],
  "page": 1,
  "limit": 20,
  "total": 0
}
```

## Analytics

Analytics endpoints require a Bearer access token.

### `GET /api/v1/analytics/dashboard`

Returns dashboard data for the authenticated user.

Query params:

- `from`: optional inclusive ISO datetime
- `to`: optional inclusive ISO datetime
- `timezone`: default `Asia/Jakarta`

If `from` is omitted, the backend defaults to the start of the month for the requested timezone. If `to` is omitted, the backend uses the current server time.

Response `200` shape:

```json
{
  "period": {
    "from": "2026-06-01T00:00:00.000Z",
    "to": "2026-06-30T16:59:59.000Z",
    "timezone": "Asia/Jakarta"
  },
  "summary": {
    "incomeTotalIdr": 8000000,
    "expenseTotalIdr": 3500000,
    "netTotalIdr": 4500000,
    "transactionCount": 42,
    "savingRatePercent": 56
  },
  "persona": {
    "id": "018f2e92-3040-70e2-9a62-bfb5cba94f2d",
    "persona": "rational",
    "confidence": 0.87,
    "probabilities": {
      "emotional": 0.05,
      "impulsive": 0.08,
      "rational": 0.87
    },
    "transactionCount": 42,
    "createdAt": "2026-06-03T04:20:00.000Z",
    "predictionSource": "period"
  },
  "predictionSource": "period",
  "recentTransactions": [],
  "topCategories": [],
  "trends": {
    "weekly": [],
    "weekdayWeekend": {
      "weekdayTotalIdr": 2500000,
      "weekendTotalIdr": 1000000,
      "weekdayAverageDailyIdr": 125000,
      "weekendAverageDailyIdr": 125000
    }
  },
  "warnings": [],
  "moneyLeaks": [],
  "insights": []
}
```

Dashboard notes:

- `persona` is `null` when no prediction exists.
- `predictionSource` is `period`, `latest`, or `null`.
- `recentTransactions` returns up to 3 items.
- `topCategories` returns up to 5 expense categories.
- `warnings` are derived from the latest persisted prediction.
- `moneyLeaks` are derived from repeated small expense transactions in the selected period.
- `insights` returns up to 3 frontend-ready insight cards.

## Not Exposed

The following are not currently mounted as backend HTTP endpoints:

- Standalone feature-engineering endpoints
- Transaction file import/export endpoints
- Separate warning endpoints
- Dedicated database/ML health endpoints beyond process checks at `GET /` and `GET /health`

## Frontend Integration Notes

- Use `/api/v1/auth/me` to read the current profile and `/api/v1/users/me` to update it.
- Keep access tokens in app state and call refresh with credentials when an access token expires.
- Use `GET /api/v1/categories?kind=expense` before creating an expense transaction.
- Match transaction `type` with the selected category `kind`; otherwise the backend returns `422`.
- Create a prediction with `POST /api/v1/predictions/persona` before expecting persona/warnings on the dashboard.
- The dashboard does not call the ML service directly; it reads persisted predictions and stored transactions.
