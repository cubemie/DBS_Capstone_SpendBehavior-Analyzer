# Backend Development Guide

Project: SpendBehavior Analyzer / BUDU

This guide is for planning backend development only. It does not prescribe any immediate code changes outside future backend implementation work.

## 1. Repo Analysis Summary

### Monorepo Shape

- Root overview: `README.md` describes SpendBehavior Analyzer as a web platform that analyzes transaction behavior, classifies financial personality, and gives personal insights/warnings.
- Team/project plan: `Project Plan - CC26-PSU268 (1).pdf` confirms the capstone title, fintech theme, web platform scope, backend/database/API responsibility, FastAPI ML service, and out-of-scope banking/e-wallet integration, real-time transaction processing, mobile apps, payments, transfers, and balance management.
- Collaboration guide: `GIT_WORKFLOW.md` describes role-based directories: `data/`, `ds/`, `fs/`, and `ml/`.
- Frontend app: `fs/frontend/` is a React/Vite app with mock screens for auth, dashboard, transaction history, analysis, warnings, profile, and adding transactions.
- Backend app: `fs/backend/` is an Express/TypeScript scaffold with auth and user endpoints, Drizzle schema files, a PostgreSQL docker compose file, and Bruno API collection files.
- ML service: `ml/` contains a FastAPI inference service, TensorFlow/Keras model artifacts, scaler, feature order, preprocessing, model training, and rule scripts.
- DS workspace: `ds/` contains a Streamlit dashboard, notebook, exported IDR CSV datasets, numpy train/validation/test arrays, and model metadata.
- Older/root data: `data/` contains `user_profiles.csv` and `transactions_clean.csv` with older/non-IDR-style fields. Prefer the newer BUDU IDR data under `ml/data/` and `ds/` for backend planning.

### Backend-Specific Findings

- Stack is explicitly stated in `fs/backend/AGENTS.md`: TypeScript ESM, Express 5, PostgreSQL, Drizzle ORM v1.0.0-beta, Zod 4, and JWT auth with `jsonwebtoken`.
- Installed backend dependencies in `fs/backend/package.json` include `express@^5.2.1`, `zod@^4.4.3`, `drizzle-orm@^1.0.0-beta.22`, `drizzle-kit@^1.0.0-beta.22`, `pg`, `bcrypt`, and `jsonwebtoken`. There is no `jose` dependency.
- Current backend entrypoints are `fs/backend/src/server.ts` and `fs/backend/src/app.ts`.
- Current routes are mounted as:
  - `POST /authentications` from `fs/backend/src/routes/auth-route.ts`
  - `POST /users` and `GET /users/:id` from `fs/backend/src/routes/user-route.ts`
  - `GET /` health-like hello route in `fs/backend/src/app.ts`
- Current validation uses Zod schemas in `fs/backend/src/schemas/auth-schema.ts` and `fs/backend/src/schemas/user-schema.ts`.
- Current JWT helpers use `jsonwebtoken` in `fs/backend/src/utils/jwt.ts`.
- Current auth middleware stores decoded token payload on `req.payload` in `fs/backend/src/middlewares/auth-middleware.ts`, with Express type augmentation in `fs/backend/src/types/express/index.d.ts`.
- Current error middleware centralizes `AppException` and `ZodError` handling in `fs/backend/src/middlewares/error-middleware.ts`.
- Current database connection uses Drizzle node-postgres in `fs/backend/src/db/index.ts` with `casing: 'snake_case'`.
- Current schema files are:
  - `fs/backend/src/db/schemas/users.ts`
  - `fs/backend/src/db/schemas/transactions.ts`
- Current migration is `fs/backend/drizzle/20260516101907_young_chronomancer/migration.sql`.
- Current Drizzle config is `fs/backend/drizzle.config.ts`; generated migrations go to `fs/backend/drizzle`.
- Local Postgres is defined in `fs/backend/docker-compose.yml` on `127.0.0.1:5434`, database `sba_local`.
- Example env vars are in `fs/backend/.env.example`.
- Bruno collection files under `fs/backend/tests/bruno/` cover register, login, wrong-password, authenticated user detail, and unauthenticated user detail.

### Frontend Signals Relevant to Backend

- `fs/frontend/src/App.tsx` defines routes for login, register, dashboard, analysis, transaction history, warnings, profile, and add transaction.
- `fs/frontend/src/types/models.ts` defines domain models for `User`, `Transaction`, `SpendingCategory`, `Budget`, `Warning`, and `Insight`.
- `fs/frontend/src/services/mockData.ts` contains mock current user, transactions, categories, budgets, warnings, money leaks, insights, weekly trend, spending rhythm, monthly summary, and quick actions.
- `fs/frontend/src/services/apiClient.ts` already supports JSON requests and optional Bearer token headers, but pages are still mostly mock-driven.
- `fs/frontend/src/pages/TambahTransaksi.tsx` shows expected transaction input fields: type, amount, category, description, merchant, payment method, and date.
- `fs/frontend/src/pages/RiwayatTransaksi.tsx` shows expected transaction list features: summary cards, category filters, search, pagination-like display, and export action.
- `fs/frontend/src/pages/Analisis.tsx` shows expected analytics: spending trend, top categories, weekday/weekend comparison, saving rate, and recommendations.
- `fs/frontend/src/pages/Peringatan.tsx` shows expected smart warnings and money leak detection.
- `fs/frontend/src/pages/Profil.tsx` shows expected user profile details, persona, app preferences, notification settings, and membership/billing mock fields.

### ML/DS Signals Relevant to Backend

- `ml/README.md` documents a FastAPI AI service on `http://localhost:8000` with:
  - `POST /predict`
  - `POST /analyze-warnings`
  - `GET /test-random`
- `ml/app/main.py` implements the same endpoints and loads:
  - `ml/models/persona_classifier.keras`
  - `ml/models/scaler.pkl`
  - `ml/feature_order.json`
  - `ml/data/budu_user_profiles_idr.csv` for testing
- `ml/feature_order.json` is the production source of truth for the current FastAPI input order. It contains 19 features.
- `ml/src/data_clean/preprocessing.py` reads `feature_order.json`, selects those columns from `budu_user_profiles_idr.csv`, fills missing values with 0, stratifies train/val/test, and saves `StandardScaler`.
- `ml/src/models/train_model.py` builds a Keras dense/dropout classifier with 3 output classes.
- `ml/src/models/rules.py` contains rule functions for money leak detection and behavior pattern warnings.
- `ml/run_pipeline.py` trains from `ml/data/budu_user_profiles_idr.csv` and writes model/scaler to `ml/models/`.
- `ds/dashboard.py` generates 1,000 users and about 50,000 IDR transactions, builds user features, clusters personas, and includes a data dictionary.
- `ds/dashboard.py` says `budu_transactions_clean_idr.csv` is for Dashboard and REST API, `budu_user_profiles_idr.csv` is for REST API and Dashboard, and `budu_dummy_users.csv` is for segment analysis.
- `ds/budu_model_metadata.json` describes v3 with 15 features including `pendapatan_bulan`; `ml/feature_order.json` describes a 19-feature inference contract without `pendapatan_bulan`. This mismatch must be resolved before production ML integration.

## 2. Product Understanding

### Confirmed Facts

- The product helps users understand spending behavior, not only nominal spending. Source: `README.md`.
- Core feature themes are behavior pattern detection, spending personality classification, smart warnings, money leak detection, and weekly reflection. Source: `Project Plan - CC26-PSU268 (1).pdf`.
- The web app is in scope; mobile app, banking/e-wallet integration, real-time processing, payments, transfers, and balance management are out of scope. Source: `Project Plan - CC26-PSU268 (1).pdf`.
- Frontend screens already cover login/register, dashboard, transaction history, analytics, warnings, profile, and add transaction. Source: `fs/frontend/src/App.tsx`.
- Current frontend data is mocked. Source: `fs/frontend/src/services/mockData.ts`.
- Backend already has minimal auth/user code. Source: `fs/backend/src/routes/auth-route.ts`, `fs/backend/src/routes/user-route.ts`.
- ML inference is currently a separate FastAPI service. Source: `ml/app/main.py`.
- The ML inference request currently expects numeric `features: number[]`, not raw transaction objects. Source: `ml/README.md`, `ml/app/main.py`, `ml/feature_order.json`.
- Categories in the BUDU IDR dataset are Indonesian categories such as `Makanan & Minuman`, `Transportasi`, `Hiburan`, `Belanja Online`, `Pulsa & Data`, and `Sembako & Kebutuhan Pokok`. Source: `ml/data/budu_transactions_clean_idr.csv`.

### Assumptions

- The backend should become the single API consumed by the frontend and should call the FastAPI ML service when predictions/warnings are needed.
- The backend should compute the ML feature vector from stored transactions instead of asking the frontend to send the 19-element array.
- The production domain should use IDR amounts and Indonesian categories from `ml/data/` / `ds/`, not the older root `data/` BYN-style dataset.
- MVP import/export can be CSV-based. Direct bank/e-wallet syncing is out of scope.
- Weekly reflection can be represented initially as analytics snapshots plus prediction/warning results, without adding a separate complex reporting engine.
- Budgets are useful because the frontend mocks budget cards, but they are secondary to auth, transactions, analytics, and ML integration.

## 3. Backend Responsibilities and Non-Responsibilities

### Responsibilities

- Own user accounts, password hashing, JWT auth, refresh-token/session state, and authenticated route protection.
- Store user transactions, categories, payment methods, and optional user preferences.
- Provide REST APIs for frontend screens in `fs/frontend/src/pages/`.
- Validate all request payloads, params, and query strings with Zod 4.
- Persist analytics snapshots and prediction results so dashboard and profile pages do not require re-running ML inference on every request.
- Compute behavior features from stored transactions using the same definitions used by ML/DS where possible.
- Call the FastAPI ML service for persona prediction and rule-based warnings after feature calculation.
- Store model version metadata and the exact feature order used for each prediction.
- Provide import/export APIs for CSV or JSON transaction workflows.
- Provide health endpoints for backend, database, and ML service reachability.

### Non-Responsibilities

- Do not connect directly to bank, card, or e-wallet provider APIs in the MVP.
- Do not process payments, transfers, or real account balances.
- Do not run full TensorFlow model training inside the Node backend.
- Do not replace the FastAPI ML service unless the team explicitly decides to port inference later.
- Do not expose ML debug endpoint `/test-random` to production frontend users.
- Do not store raw model files in the database.
- Do not implement real-time streaming analysis for MVP; use historical/batch-style analysis.

## 4. Recommended Backend Architecture

Use the architecture already required by `fs/backend/AGENTS.md`:

```text
routes -> controllers -> services -> repositories -> database
```

Current backend code has routes, controllers, services, schemas, middleware, and DB schema files, but no repositories yet. Future feature work should add repositories and move database queries out of services.

### Layer Responsibilities

- Routes: register endpoint paths and middleware only.
- Controllers: parse HTTP inputs with Zod schemas, call services, return responses.
- Services: enforce business rules, orchestration, feature calculation, ML-service calls, and transactions across repositories.
- Repositories: Drizzle database access only.
- Database: Drizzle schema definitions, generated migrations, and PostgreSQL.
- Schemas: Zod request/response DTOs per feature.
- Middlewares: auth, error handling, request context, and optional request logging.

### Example Flow

`POST /transactions`

```text
transaction-route.ts
  -> requireAuth
  -> transaction-controller.create()
  -> createTransactionSchema.parse(req.body)
  -> transactionService.create(req.payload.sub, dto)
  -> transactionRepository.insert(...)
  -> analyticsService.invalidateUserPeriod(...)
  -> response
```

`POST /predictions/persona`

```text
prediction-route.ts
  -> requireAuth
  -> predictionController.createPersonaPrediction()
  -> predictionService.predictForPeriod(userId, period)
  -> transactionRepository.findForUserPeriod(...)
  -> featureService.computePersonaFeatures(...)
  -> mlClient.predict(features)
  -> predictionRepository.insert(...)
  -> response
```

## 5. Recommended Backend Folder Structure

Keep kebab-case and the current ESM `.ts` import style.

```text
fs/backend/src/
  app.ts
  server.ts
  config.ts
  exception.ts
  db/
    index.ts
    schemas/
      users.ts
      sessions.ts
      categories.ts
      transactions.ts
      budgets.ts
      analytics-snapshots.ts
      prediction-results.ts
      import-jobs.ts
      model-versions.ts
  middlewares/
    auth-middleware.ts
    error-middleware.ts
  modules/
    auth/
      auth-route.ts
      auth-controller.ts
      auth-service.ts
      auth-repository.ts
      auth-schema.ts
    users/
      user-route.ts
      user-controller.ts
      user-service.ts
      user-repository.ts
      user-schema.ts
    transactions/
      transaction-route.ts
      transaction-controller.ts
      transaction-service.ts
      transaction-repository.ts
      transaction-schema.ts
    categories/
      category-route.ts
      category-controller.ts
      category-service.ts
      category-repository.ts
      category-schema.ts
    analytics/
      analytics-route.ts
      analytics-controller.ts
      analytics-service.ts
      analytics-repository.ts
      analytics-schema.ts
      feature-service.ts
    predictions/
      prediction-route.ts
      prediction-controller.ts
      prediction-service.ts
      prediction-repository.ts
      prediction-schema.ts
      ml-client.ts
    import-export/
      import-export-route.ts
      import-export-controller.ts
      import-export-service.ts
      import-job-repository.ts
      import-export-schema.ts
    health/
      health-route.ts
      health-controller.ts
  utils/
    jwt.ts
    password.ts
    response.ts
    date.ts
```

The repo currently uses top-level `src/routes`, `src/controllers`, `src/services`, and `src/schemas`. That is acceptable for the initial scaffold, but feature modules will scale better as transactions, analytics, imports, and ML integration are added.

## 6. PostgreSQL Schema Plan

Use Drizzle ORM v1.0.0-beta APIs and generate migrations with Drizzle Kit. Use UUID primary keys, `created_at`, `updated_at`, and `deleted_at` only where soft delete is actually needed.

### `users`

Current base exists in `fs/backend/src/db/schemas/users.ts`.

Recommended fields:

- `id uuid primary key default gen_random_uuid()`
- `full_name text not null`
- `email text not null unique`
- `password_hash text not null`
- `phone text null`
- `avatar_url text null`
- `persona text null`
- `membership text not null default 'Free'`
- `locale text not null default 'id-ID'`
- `timezone text not null default 'Asia/Jakarta'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Notes:

- The current frontend user model includes `phone`, `persona`, and `membership` in `fs/frontend/src/types/models.ts`; current backend user schema does not.
- Do not return `password_hash`.

### `refresh_tokens` / `sessions`

Recommended table: `refresh_tokens`.

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references users(id) on delete cascade`
- `token_hash text not null unique`
- `expires_at timestamptz not null`
- `revoked_at timestamptz null`
- `replaced_by_token_id uuid null`
- `user_agent text null`
- `ip_address text null`
- `created_at timestamptz not null default now()`

Notes:

- Current auth only issues a 1-day access token in `fs/backend/src/utils/jwt.ts`.
- Add refresh tokens if the frontend needs durable login.

### `categories`

Recommended table:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid null references users(id) on delete cascade`
- `name text not null`
- `slug text not null`
- `kind text not null` (`income`, `expense`, `transfer` if needed)
- `ml_key text null`
- `color text null`
- `icon text null`
- `is_system boolean not null default false`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Notes:

- Seed system expense categories from the BUDU IDR data and frontend mocks:
  `Makanan & Minuman`, `Transportasi`, `Belanja Online`, `Fashion & Pakaian`, `Hiburan`, `Kesehatan`, `Kesehatan & Kecantikan`, `Pendidikan`, `Pulsa & Data`, `Sembako & Kebutuhan Pokok`, plus `Lainnya`.
- `ml_key` maps a category to feature keys such as `cat_makanan_minuman_ratio`.

### `transactions`

Current base exists in `fs/backend/src/db/schemas/transactions.ts`, but it stores category as text.

Recommended fields:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references users(id) on delete cascade`
- `category_id uuid null references categories(id)`
- `title text not null`
- `merchant_name text null`
- `payment_method text null`
- `type text not null` (`income`, `expense`)
- `amount_idr bigint not null`
- `transaction_date timestamptz not null`
- `notes text null`
- `source text not null default 'manual'`
- `import_job_id uuid null references import_jobs(id)`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Indexes:

- `(user_id, transaction_date desc)`
- `(user_id, category_id)`
- `(user_id, type, transaction_date)`
- optional full-text/trigram later for title/merchant search, not needed for MVP.

Notes:

- Use positive `amount_idr` plus `type`, instead of negative amounts, because the frontend mock uses negative expenses but the ML datasets use positive expense amounts.
- Preserve enough fields to compute `is_weekend`, `is_night`, rolling spikes, category ratios, and payment method summaries.

### `budgets`

Useful because `fs/frontend/src/services/mockData.ts` and `fs/frontend/src/pages/Dashboard.tsx` show monthly category budgets.

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references users(id) on delete cascade`
- `category_id uuid not null references categories(id)`
- `period_month date not null`
- `limit_idr bigint not null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Unique:

- `(user_id, category_id, period_month)`

### `analytics_snapshots`

Recommended table for dashboard/analysis caches and weekly reflection.

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references users(id) on delete cascade`
- `period_type text not null` (`week`, `month`, `custom`)
- `period_start date not null`
- `period_end date not null`
- `summary jsonb not null`
- `features jsonb null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Examples for `summary`:

- balance/income/expense/saving rate
- top categories
- weekly trend
- spending rhythm
- weekday/weekend comparison
- money leak estimates

### `prediction_results`

Recommended table:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references users(id) on delete cascade`
- `model_version_id uuid null references model_versions(id)`
- `analytics_snapshot_id uuid null references analytics_snapshots(id)`
- `period_start date not null`
- `period_end date not null`
- `persona text not null`
- `confidence numeric not null`
- `probabilities jsonb not null`
- `warnings jsonb not null`
- `feature_order text[] not null`
- `features jsonb not null`
- `ml_response jsonb not null`
- `created_at timestamptz not null default now()`

Notes:

- Store exact `feature_order` and `features` for reproducibility.
- Use JSONB for probabilities/warnings because the ML response shape can evolve.

### `import_jobs`

Recommended table:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references users(id) on delete cascade`
- `source text not null` (`csv`, `json`, `seed`, `manual_batch`)
- `status text not null` (`pending`, `processing`, `completed`, `failed`)
- `file_name text null`
- `total_rows integer not null default 0`
- `processed_rows integer not null default 0`
- `failed_rows integer not null default 0`
- `error_summary jsonb null`
- `created_at timestamptz not null default now()`
- `completed_at timestamptz null`

Notes:

- MVP can parse uploaded/imported CSV in memory or via temporary file handling later.
- Persist import metadata even if individual failed rows are only summarized at first.

### `model_versions`

Recommended table:

- `id uuid primary key default gen_random_uuid()`
- `name text not null`
- `version text not null`
- `service_url text not null`
- `feature_order text[] not null`
- `metadata jsonb null`
- `is_active boolean not null default false`
- `created_at timestamptz not null default now()`

Notes:

- Seed from `ml/feature_order.json` and metadata from `ml/data/budu_model_metadata.json` or `ds/budu_model_metadata.json` after the feature contract mismatch is resolved.

## 7. REST API Endpoint Plan

Prefer `/api/v1` for new endpoints. Current endpoints (`/users`, `/authentications`) can remain during transition or be mounted under `/api/v1` when frontend integration starts.

### Auth

- `POST /api/v1/auth/register`
  - Creates user.
  - Maps to current `POST /users` behavior.
- `POST /api/v1/auth/login`
  - Returns access token and optional refresh token.
  - Maps to current `POST /authentications` behavior.
- `POST /api/v1/auth/refresh`
  - Rotates refresh token and returns new access token.
- `POST /api/v1/auth/logout`
  - Revokes current refresh token/session.
- `GET /api/v1/auth/me`
  - Returns current authenticated user.

### Users

- `GET /api/v1/users/me`
  - Profile for `fs/frontend/src/pages/Profil.tsx`.
- `PATCH /api/v1/users/me`
  - Update full name, phone, avatar URL, locale/timezone/preferences.
- `PATCH /api/v1/users/me/password`
  - Change password after current password verification.
- `GET /api/v1/users/me/persona`
  - Latest persona and explanation from `prediction_results`.

Avoid exposing arbitrary `GET /users/:id` to normal users unless admin roles are added.

### Transactions

- `GET /api/v1/transactions`
  - Query: `page`, `limit`, `from`, `to`, `categoryId`, `type`, `search`, `sort`.
  - Supports `fs/frontend/src/pages/RiwayatTransaksi.tsx`.
- `POST /api/v1/transactions`
  - Supports manual form in `fs/frontend/src/pages/TambahTransaksi.tsx`.
- `GET /api/v1/transactions/:id`
- `PATCH /api/v1/transactions/:id`
- `DELETE /api/v1/transactions/:id`
- `GET /api/v1/transactions/summary`
  - Query: `from`, `to`.
  - Returns balance/income/expense cards.

### Categories

- `GET /api/v1/categories`
  - Returns system and user categories.
- `POST /api/v1/categories`
  - Optional user-created category.
- `PATCH /api/v1/categories/:id`
- `DELETE /api/v1/categories/:id`
  - Only for user-owned categories with no blocking usage, or soft-delete later.

### Budgets

Although not explicitly requested as an endpoint group, budgets are useful for dashboard support.

- `GET /api/v1/budgets?month=2026-05`
- `PUT /api/v1/budgets/:categoryId`
  - Upsert monthly budget limit.
- `DELETE /api/v1/budgets/:id`

### Analytics

- `GET /api/v1/analytics/dashboard`
  - Returns current persona card, recent transactions, spending rhythm, budget usage, primary warnings/leaks, insights.
- `GET /api/v1/analytics/summary`
  - Query: `from`, `to`.
  - Returns monthly/period summary.
- `GET /api/v1/analytics/trends`
  - Weekly/monthly trend for `fs/frontend/src/pages/Analisis.tsx`.
- `GET /api/v1/analytics/categories`
  - Top category amount and percentage.
- `GET /api/v1/analytics/rhythm`
  - Day-of-week and weekday/weekend comparison.
- `GET /api/v1/analytics/warnings`
  - Smart warnings and money leaks for `fs/frontend/src/pages/Peringatan.tsx`.
- `POST /api/v1/analytics/snapshots`
  - Recompute and store a snapshot for a period.

### Predictions / ML

- `POST /api/v1/predictions/persona`
  - Body: period fields, optional force recompute.
  - Backend computes features and calls FastAPI `/predict`.
- `GET /api/v1/predictions/latest`
  - Latest persisted persona prediction.
- `GET /api/v1/predictions/history`
  - Period-based prediction history.
- `POST /api/v1/predictions/warnings`
  - Backend computes features and calls FastAPI `/analyze-warnings` or local rules.
- `GET /api/v1/model-versions`
  - List known/active ML model versions for debugging/admin.

Do not proxy `GET /test-random` from `ml/app/main.py` to end users.

### Import / Export

- `POST /api/v1/imports/transactions`
  - CSV/JSON import for transactions.
- `GET /api/v1/imports/:id`
  - Import status and error summary.
- `GET /api/v1/exports/transactions`
  - Query: `from`, `to`, `format=csv|json`.
- `GET /api/v1/exports/analytics`
  - Optional later endpoint for reports/reflections.

### Health

- `GET /api/v1/health`
  - Backend alive.
- `GET /api/v1/health/db`
  - Database connectivity.
- `GET /api/v1/health/ml`
  - FastAPI service connectivity and active model version if available.

## 8. ML/DS Integration Plan

### Current ML Contract

`ml/app/main.py` expects:

```json
{
  "features": [0, 0, 0]
}
```

The list length must match `ml/feature_order.json`. Current order:

1. `avg_txn_idr`
2. `txn_count`
3. `weekend_ratio`
4. `night_ratio`
5. `above_avg_ratio`
6. `spike_ratio`
7. `impulse_score`
8. `unique_categories`
9. `spending_cov`
10. `cat_makanan_minuman_ratio`
11. `cat_transportasi_ratio`
12. `cat_kesehatan_kecantik_ratio`
13. `cat_sembako_kebutuhan__ratio`
14. `cat_kesehatan_ratio`
15. `cat_pendidikan_ratio`
16. `cat_belanja_online_ratio`
17. `cat_pulsa_data_ratio`
18. `cat_hiburan_ratio`
19. `cat_fashion_pakaian_ratio`

Backend should not let the frontend send this array directly. Backend should compute it from stored transactions and send it to ML.

### Feature Calculation Source

Use these repo sources as implementation references:

- `ds/dashboard.py`, function `build_user_features`, for aggregate formulas.
- `ml/src/data_clean/preprocessing.py`, for `feature_order.json` usage.
- `ml/src/models/rules.py`, for money leak and warning rule thresholds.
- `ml/README.md`, for endpoint request/response contract.
- `ml/data/budu_transactions_clean_idr.csv`, for expected transaction fields.
- `ml/data/budu_user_profiles_idr.csv`, for expected profile feature output.

### Recommended Backend Flow

1. User creates/imports transactions through backend.
2. Backend stores normalized transaction rows in PostgreSQL.
3. Backend computes analytics features for a selected period:
   - average amount
   - transaction count
   - weekend ratio
   - night ratio
   - above-average ratio
   - spike ratio
   - impulse score
   - unique category count
   - spending coefficient of variation
   - category amount ratios
4. Backend loads active model feature order from `model_versions`.
5. Backend builds a numeric array in that exact order.
6. Backend calls FastAPI:
   - `/predict` for persona + probabilities + warnings
   - `/analyze-warnings` for warning-only use cases
7. Backend persists the prediction in `prediction_results`.
8. Frontend reads results from backend only.

### Feature Contract Mismatch To Resolve

There is a real mismatch:

- `ml/feature_order.json` uses 19 features and no `pendapatan_bulan`.
- `ds/dashboard.py` data dictionary says "20 fitur v3" and includes `pendapatan_bulan`.
- `ds/budu_model_metadata.json` says v3 has 15 features and includes `pendapatan_bulan`.
- `ml/data/budu_model_metadata.json` says 14 features in metadata, while `ml/feature_order.json` has 19.

Decision needed before implementation:

- Treat `ml/feature_order.json` as the current deployed inference source of truth for MVP, because `ml/app/main.py` reads it at runtime.
- Ask ML/DS team to publish a single versioned model contract with:
  - model artifact path
  - scaler path
  - exact feature order
  - exact label mapping
  - expected input units
  - model version string
  - sample request/response

### ML Client Strategy

- Add `ML_SERVICE_URL` to backend env.
- Use a small `ml-client.ts` wrapper around `fetch`, not a large SDK.
- Set a timeout and return controlled `503` errors when ML is unavailable.
- Persist feature vectors and raw ML response to make debugging possible.
- Do not call ML on every dashboard request. Cache via `analytics_snapshots` and `prediction_results`.

## 9. Zod Validation, Error Handling, and JWT Auth Strategy

### Zod 4

- Validate `body`, `params`, and `query` in controllers or via a small validation helper.
- Keep schemas near feature modules.
- Use `z.coerce.number()` for pagination/query numbers.
- Use `z.iso.date()` or appropriate date-string validation for date inputs.
- Use `z.enum()` for controlled strings such as transaction type, import status, period type, and membership.
- Use response DTO schemas for critical API responses if the frontend contract is unstable.

Examples of validations to enforce:

- Transaction amount must be a positive integer IDR amount.
- Expense/income type must be explicit.
- Date ranges must have `from <= to`.
- Category IDs must be UUIDs.
- Pagination limits must have sane max limits.
- Login/register must enforce email and minimum password length.

### Error Handling

Keep `fs/backend/src/middlewares/error-middleware.ts` as the central pattern.

Recommended response shape:

```json
{
  "message": "Validasi gagal",
  "details": [{ "field": "amountIdr", "message": "Must be greater than 0" }]
}
```

Use these statuses:

- `400` validation or malformed request
- `401` missing/invalid/expired token
- `403` authenticated but not allowed
- `404` missing resource
- `409` duplicate email or conflicting resource
- `422` semantically invalid import rows or unsupported category mapping
- `503` ML service or database dependency unavailable

### JWT Auth

- Continue using `jsonwebtoken`, as required by `fs/backend/AGENTS.md` and current `fs/backend/src/utils/jwt.ts`.
- Do not introduce `jose`.
- Access token payload should stay minimal: `sub`, optional `sessionId`, optional `role`, `iat`, `exp`.
- Use short-lived access tokens and hashed refresh tokens in `refresh_tokens`.
- `requireAuth` should verify the Bearer token and attach a typed payload to `req.payload`.
- Resource access should use `req.payload.sub` instead of trusting `userId` from request bodies.
- For MVP, admin roles are unnecessary unless needed for model-version management.

## 10. Phased Backend Development Roadmap

### Phase 0: Align Contracts

- Confirm the backend API base path with frontend.
- Confirm the ML feature contract mismatch between `ml/feature_order.json`, `ml/data/budu_model_metadata.json`, `ds/budu_model_metadata.json`, and `ds/dashboard.py`.
- Decide whether current `/users` and `/authentications` paths stay or move to `/api/v1/auth/*`.
- Decide whether frontend profile fields (`phone`, `membership`, `persona`) are persisted in users or derived from related tables.

### Phase 1: Stabilize Existing Backend Scaffold

- Keep Express 5, TypeScript ESM, Zod 4, Drizzle beta, PostgreSQL, and `jsonwebtoken`.
- Add repositories for current auth/user queries.
- Fix current API contract gaps before frontend integration:
  - registration payload in `fs/backend/tests/bruno/Users/Register.yml` does not include `avatarUrl`, while `createUserSchema` currently requires it in `fs/backend/src/schemas/user-schema.ts`.
  - current service query patterns should be reviewed when repositories are added.
- Add `/api/v1/health` and `/api/v1/auth/me`.
- Add consistent response shapes.

### Phase 2: Transactions and Categories

- Add `categories` schema and seed system categories from IDR dataset/frontend categories.
- Expand `transactions` schema to include type, title, payment method, category ID, amount IDR, and source.
- Implement transaction CRUD, list filters, search, pagination, and summary.
- Wire frontend transaction history and add-transaction pages to API.

### Phase 3: Analytics Snapshots

- Implement analytics aggregation from PostgreSQL.
- Return dashboard summary, recent transactions, category breakdown, trend, rhythm, and weekday/weekend comparison.
- Add budget table/endpoints if dashboard budget cards remain in MVP.
- Store snapshots for monthly and weekly periods.

### Phase 4: ML Integration

- Add `model_versions`.
- Add `ml-client.ts` with `/predict` and `/analyze-warnings` calls.
- Implement feature calculation matching active feature order.
- Persist prediction results with feature vectors and ML response.
- Expose latest persona, prediction history, smart warnings, and money leaks to frontend.

### Phase 5: Import/Export

- Add import jobs for transaction CSV/JSON import.
- Map imported category names to system/user categories.
- Return failed row summaries.
- Add transaction export endpoint for the existing frontend export action.

### Phase 6: Hardening and Deployment

- Add integration tests for auth, transactions, analytics, and prediction workflows.
- Add database migration review workflow.
- Add dependency health checks.
- Add rate limiting only if the deployed app is public.
- Configure environment variables for backend URL, database URL, JWT secrets, token TTLs, and ML service URL.

## 11. Open Questions and Assumptions

### Open Questions

- Which ML feature contract is final: `ml/feature_order.json` with 19 features, DS v3 metadata with 15 features, or DS dashboard dictionary with 20 features?
- Should `pendapatan_bulan` be collected from users, imported from DS profiles, or excluded from MVP inference?
- Should category labels in the frontend be changed to match exact ML labels (`Makanan` vs `Makanan & Minuman`, `Belanja` vs `Belanja Online`)?
- Should expenses be stored as positive amounts with `type = expense`, or should backend mirror frontend negative expense amounts?
- Does the product need refresh tokens for MVP, or is a short-lived access token enough for demo?
- Will imported transactions come from a user-uploaded CSV, a seed dataset, or frontend manual entry only?
- Does weekly reflection need a separate user-visible report table, or can it be served from analytics snapshots?
- Should model versions be managed by backend admins, migrations/seeds, or a config file?
- Is membership/billing real or just UI copy for now?
- Are notification preferences in profile in scope for MVP backend persistence?

### Current Assumptions

- Backend should use the BUDU IDR datasets and ML artifacts, not the older root `data/` dataset.
- Backend should compute ML features server-side from transaction rows.
- The frontend should never call FastAPI ML directly in production.
- MVP should focus on historical analysis and manual/CSV transaction ingestion.
- Budgets are useful but can come after transactions and analytics if schedule is tight.
- PostgreSQL is the only persistent database for backend MVP.
- Model inference remains in Python/FastAPI during MVP.

## Inspected Areas and Remaining Assumptions

### Inspected Areas

- Root documentation: `README.md`, `GIT_WORKFLOW.md`, `Project Plan - CC26-PSU268 (1).pdf`.
- Backend configuration and code: `fs/backend/package.json`, `fs/backend/AGENTS.md`, `fs/backend/src/**`, `fs/backend/drizzle.config.ts`, `fs/backend/drizzle/20260516101907_young_chronomancer/migration.sql`, `fs/backend/docker-compose.yml`, `fs/backend/.env.example`.
- Backend API tests: `fs/backend/tests/bruno/**`.
- Frontend package, API client, routes, pages, types, and mock data: `fs/frontend/package.json`, `fs/frontend/src/App.tsx`, `fs/frontend/src/services/apiClient.ts`, `fs/frontend/src/services/mockData.ts`, `fs/frontend/src/types/models.ts`, `fs/frontend/src/pages/*.tsx`.
- ML docs, service, model/training/preprocessing/rules scripts, artifacts, and feature order: `ml/README.md`, `ml/app/main.py`, `ml/feature_order.json`, `ml/src/**`, `ml/models/**`, `ml/data/**`.
- DS dashboard, notebook summary, metadata, numpy artifacts, and exported datasets: `ds/dashboard.py`, `ds/budu_V3.ipynb`, `ds/budu_model_metadata.json`, `ds/*.csv`, `ds/*.npy`.
- Root datasets: `data/user_profiles.csv`, `data/transactions_clean.csv`.

### Remaining Assumptions

- The final production ML contract still needs team confirmation because multiple repo files disagree on feature count and feature names.
- Frontend API paths can still change because current pages use mock data and current backend paths are early scaffold paths.
- User profile, membership, notifications, and billing UI fields may be demo-only until product scope confirms persistence requirements.
- Import/export format is assumed to be CSV/JSON because no production import contract exists yet.
