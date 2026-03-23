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

**Legacy Support:**
- If you have an older project using `SUPABASE_SERVICE_ROLE_KEY`, it will still work as a fallback
- New projects should use `SUPABASE_SECRET_KEY` (the modern naming)

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
