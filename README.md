# Hamster-BOCRA-website

Website for BOCRA hackathon, includes frontend and backend.

## Setup: Environment Variables

This project uses **Supabase** for authentication, database, and storage. You need to configure environment variables for both the frontend and backend.

### Frontend Setup

Create `Frontend/.env` (copy from `Frontend/.env.example`):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

### Backend Setup

Create `backend/.env` (copy from `backend/.env.example`):

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your-secret-key
```

**Where to get these values:**
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project → Settings → API
3. Copy the values into your `.env` files

**Key Security Breakdown:**
- **VITE_SUPABASE_PUBLISHABLE_KEY**: Safe to expose in frontend code. Used for public operations like authentication.
- **SUPABASE_SECRET_KEY**: Backend-only. Gives full administrative access. Never expose to the frontend.

**⚠️ Security:**
- `.env` files are **never** committed to git (see `.gitignore`)
- The secret key must never reach the frontend or client code
- Keep your `.env` files private and secure

See [backend/README.md](backend/README.md) for detailed backend setup.

## Run the Frontend

1. Open a terminal in the project root.
2. Go to the frontend directory:

```bash
cd Frontend
```

3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

5. Open your browser at:

```text
http://localhost:8080
```

## Useful Frontend Commands

- Build for production:

```bash
npm run build
```

- Preview production build locally:

```bash
npm run preview
```

- Run lint checks:

```bash
npm run lint
```
