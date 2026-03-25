# BOCRA Frontend

React + TypeScript frontend for the BOCRA website, built with Vite and shadcn/ui.

## Getting Started

```bash
cd Frontend
npm install
npm run dev
```

The app will be available at `http://localhost:8080`.

## API Configuration

- Default backend: `https://hamster-bocra-website-production.up.railway.app`
- To force local backend during development, set `VITE_USE_LOCAL_API=true` in your local `.env`.
- Optional override: set `VITE_API_BASE_URL` to any custom backend URL.

## Available Scripts

| Command            | Description                  |
| ------------------ | ---------------------------- |
| `npm run dev`      | Start the Vite dev server    |
| `npm run build`    | Production build             |
| `npm run preview`  | Preview the production build |
| `npm run lint`     | Run ESLint                   |
| `npm run test`     | Run tests                    |


## Authentication

- Sign-up/login uses backend auth endpoints under `/api/auth/*`.
- Google OAuth is handled through Supabase Auth.
- Session bootstrap uses `GET /api/auth/me` to fetch profile role and route users.

## Vercel Deployment Notes

- Deploy this frontend from the `Frontend/` directory.
- Build command: `npm run build`
- Output directory: `dist`
- SPA rewrites are configured in `vercel.json`.
- Ensure Vercel environment variables include the three `VITE_*` keys above.

## Preview Deployments

Vercel can automatically create preview deployments for pull requests when the repository is connected to a Vercel project and preview deploys are enabled in project settings.
