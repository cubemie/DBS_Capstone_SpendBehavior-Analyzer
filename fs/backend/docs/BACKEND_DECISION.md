# Backend Decisions

This document overrides and complements `BACKEND_DEVELOPMENT_GUIDE.md`.

If there is a conflict between this document and `BACKEND_DEVELOPMENT_GUIDE.md`, follow this document.

---

# 1. ML Is The Source Of Truth

The ML service defines the production inference contract.

Backend must follow:

- `ml/feature_order.json`
- `ml/app/main.py`
- active model artifacts under `ml/models/`

The backend must not derive the inference contract from DS artifacts.

The following files are informational only and do not override the ML contract:

- `ds/dashboard.py`
- `ds/budu_model_metadata.json`
- other DS metadata files

When feature definitions differ, the ML implementation wins.

---

# 2. Backend Priorities

The backend should be developed incrementally.

Current priority order:

1. Foundation
2. Authentication
3. Categories
4. Transactions
5. Feature Engineering
6. ML Integration
7. Analytics
8. Import / Export
9. Hardening

Avoid building infrastructure that is not required by the current phase.

---

# 3. MVP Database Scope

Required tables:

- users
- refresh_tokens
- categories
- transactions

Recommended:

- prediction_results

Defer until needed:

- analytics_snapshots
- budgets
- import_jobs
- model_versions

Do not implement deferred tables unless required by a feature.

---

# 4. Feature Engineering Is A First-Class Module

Feature engineering is a core domain of SpendBehavior Analyzer.

Create a dedicated module:

```text
modules/
  feature-engineering/
```

Suggested structure:

```text
feature-engineering/
  feature-service.ts
  feature-calculator.ts
  feature-schema.ts
```

Responsibilities:

- Aggregate transaction data
- Compute ML features
- Build feature vectors
- Validate feature contracts
- Produce inputs for ML inference

Feature engineering must not be coupled to analytics endpoints.

---

# 5. Analytics Strategy

For MVP, expose a single dashboard endpoint:

```http
GET /api/v1/analytics/dashboard
```

The endpoint may aggregate:

- summary
- top categories
- trends
- persona
- warnings
- insights

Avoid creating multiple analytics endpoints until a real need appears.

Start simple.

---

# 6. Prediction Strategy

Prediction results should be persisted.

Recommended table:

```text
prediction_results
```

Goals:

- avoid repeated ML calls
- support prediction history
- support dashboard loading
- support future model comparison

The backend should never call ML for every dashboard request.

---

# 7. Backend Responsibilities

Frontend never talks directly to FastAPI.

Flow:

```text
Frontend
    ↓
Node Backend
    ↓
Feature Engineering
    ↓
ML Service
    ↓
PostgreSQL
```

All ML communication must go through the backend.

---

# 8. Development Phases

Phase 1

- Backend foundation
- Health endpoint
- Repository layer
- Response standardization

Phase 2

- Authentication
- User profile

Phase 3

- Categories

Phase 4

- Transactions

Phase 5

- Feature engineering

Phase 6

- ML integration

Phase 7

- Analytics dashboard

Phase 8

- Import/export

Phase 9

- Hardening and testing

---

# 9. Technology Decisions

Backend stack:

- TypeScript
- Express 5
- PostgreSQL
- Drizzle ORM v1.0.0-beta
- Zod 4
- jsonwebtoken

Rules:

- Use `jsonwebtoken`
- Do not use `jose`
- Use Drizzle ORM v1.0.0-beta APIs
- Use Zod 4 for all validation
- Use repository pattern
- Use layered architecture

```text
routes
  ↓
controllers
  ↓
services
  ↓
repositories
  ↓
database
```

# Warning Strategy

Warnings and money leaks are core product features.

The backend must expose warning and money leak information.

For MVP, warning and money leak data should be returned from:

GET /api/v1/analytics/dashboard

Separate warning endpoints should only be added when a real need appears.

Warning generation should follow the ML service and rule implementations under:

- ml/app/main.py
- ml/src/models/rules.py

# Membership

Membership and billing are out of scope for MVP.

Do not implement:

- subscriptions
- billing
- payment plans
- membership management

If a membership field already exists in frontend mocks,
treat it as placeholder UI data only.

The backend should not persist membership information
until a real business requirement exists.
