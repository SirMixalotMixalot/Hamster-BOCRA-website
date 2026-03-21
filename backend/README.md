# BOCRA Backend

FastAPI + Python backend for the BOCRA website.

## Getting Started

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # Fill in your Supabase credentials
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

## Project Structure

```
backend/
├── app/
│   ├── main.py          # FastAPI entry point + CORS
│   ├── config.py        # Settings via pydantic-settings
│   ├── api/             # Route modules by domain
│   ├── services/        # Business logic
│   ├── models/          # Pydantic models
│   ├── db/              # Supabase client + queries
│   └── ai/              # Chatbot pipeline, embeddings
└── tests/
```
