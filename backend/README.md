# BOCRA Backend

FastAPI + Python backend for the BOCRA website.

## Prerequisites

- **Python 3.9+** — Download from [python.org](https://www.python.org/downloads/)
- **pip** — Comes with Python
- **Supabase Project** — Get credentials from [Supabase Dashboard](https://app.supabase.com)

## Getting Started

### 1. Set up the virtual environment

```bash
cd backend
python -m venv venv
```

**On Windows:**
```bash
venv\Scripts\activate
```

**On macOS/Linux:**
```bash
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Supabase credentials

Copy the example environment file:

```bash
cp .env.example .env
```

Then open `.env` and fill in your Supabase credentials:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your-secret-key-here
FRONTEND_ORIGIN=http://localhost:8080
```

See [Environment Variables](#environment-variables) for where to find these values.

### 4. Run the development server

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

**API Documentation:**
- Interactive docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## Environment Variables

The backend requires Supabase credentials to be set in a `.env` file:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your-secret-key-here
FRONTEND_ORIGIN=http://localhost:8080
```

**Where to get these values:**
- Go to your [Supabase Dashboard](https://app.supabase.com)
- Select your project
- Settings → API
  - `SUPABASE_URL`: Copy the "Project URL"
  - `SUPABASE_SECRET_KEY`: Copy the "secret" key under "Project API keys"

**⚠️ Security Notes:**
- The `secret_key` is backend-only and gives full administrative access to your Supabase project
- Never expose it to the frontend or commit it to git (it's in `.gitignore`)
- Keep it strictly on your server
- The frontend should only use `VITE_SUPABASE_PUBLISHABLE_KEY` (safe to expose)

**Legacy Support:**
- If you have an older project using `SUPABASE_SERVICE_ROLE_KEY`, it will still work as a fallback
- New projects should use `SUPABASE_SECRET_KEY` (the modern naming)

## Complaint Email Verification

Complaint verification codes are sent via SMTP.

Endpoints:
- `POST /api/complaints/verification/send`
- `POST /api/complaints/verification/verify`

Both endpoints are email-based and can be called without authentication.

## Auth Endpoints

All auth is handled through Supabase Auth and exposed via FastAPI:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Notes:
- Auth routes are rate limited to 5 requests per minute per IP.
- JWT bearer tokens are validated for protected `/api/*` requests.
- Role checks use `public.profiles.role` as the source of truth.
- `/api/admin/*` paths are restricted to users with `role='admin'`.

## Supabase Auth Flow

- Supabase Auth is the source of truth for sign-up, login, token issuance, and OAuth.
- The backend proxies auth operations via `/api/auth/*` and validates bearer JWTs for protected routes.
- `GET /api/auth/me` returns merged auth + profile information from `auth.users` + `public.profiles`.
- Sensitive profile fields (for example `id_number`) are intentionally excluded from auth response models.

## Migration Workflow

Apply schema changes from the repository root with the Supabase CLI:

```bash
supabase db push
```

Notes:
- Migrations live in `supabase/migrations/` and should be additive/corrective.
- Seed scripts/data belong in `supabase/seed/`.
- Do not commit real `.env` files.

## RLS Overview

Row Level Security (RLS) is enabled on core app tables including:

- `profiles`
- `applications`
- `application_status_log`
- `documents`
- `complaints`
- `complaint_status_log`
- `payments`
- `news`
- `telecom_stats`
- `regulatory_decisions`
- `support_tickets`
- `audit_log`

Policy model summary:

- Users can access their own records for user-owned tables.
- Admin permissions are derived from `public.profiles.role` via `public.is_admin(auth.uid())`.
- Public read access is limited to explicitly public content (for example published news and public decisions).
- `audit_log` is admin-readable only; client-authenticated inserts are not allowed by policy.

## Storage Buckets And Policies

Storage setup is managed via migration `supabase/migrations/20260323103000_create_storage_buckets_and_policies.sql`.

Buckets:

- `application-documents` (private, 10 MB, PDF/JPG/PNG)
- `profile-photos` (private, 5 MB, JPG/PNG)
- `evidence-uploads` (private, 10 MB, PDF/JPG/PNG/MP4)
- `public-documents` (public, 20 MB, PDF)

Storage policy model:

- Private bucket files must be stored under the user prefix path: `<auth.uid()>/<filename>`.
- Users can read/write/delete only their own files in private buckets.
- Admins can read all files in private buckets.
- `public-documents` is readable by everyone; writes are admin-only.

## CORS And Rate Limiting

- CORS is restricted to localhost dev origins and configured frontend/Vercel domains.
- Add additional production domains via `FRONTEND_ORIGIN` as a comma-separated list.
- Auth endpoints are rate limited at 5 attempts/minute per IP and endpoint path.

## Manual Dashboard Steps

Complete these in Supabase dashboard if not already configured:

1. Auth → Providers: enable Email and Google OAuth.
2. Auth → URL Configuration: add site URL + redirect URLs for localhost and Vercel domains.
3. Confirm project API keys and set `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, and frontend publishable key env vars.

## Deployment Notes

- Frontend deployment is expected on Vercel from the `Frontend/` directory.
- Configure preview deployments for pull requests in Vercel project settings (if not already enabled).
- Ensure backend CORS allowlist includes active production and preview frontend domains.

## Virtual Environment Management

**Activate the virtual environment:**

```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

**Deactivate when done:**

```bash
deactivate
```

**Important:** Always activate the virtual environment before running any backend commands.

## Managing Dependencies

To add a new dependency:

```bash
pip install package-name
pip freeze > requirements.txt
```

To install a specific version:

```bash
pip install package-name==1.2.3
pip freeze > requirements.txt
```

## Project Structure

```
backend/
├── app/
│   ├── main.py          # FastAPI entry point + CORS
│   ├── config.py        # Settings loading
│   ├── core/            # Core configuration
│   ├── api/             # Route modules by domain
│   ├── services/        # Business logic
│   ├── models/          # Pydantic models
│   ├── db/              # Supabase client + queries
│   └── ai/              # Chatbot pipeline, embeddings
└── tests/
```
