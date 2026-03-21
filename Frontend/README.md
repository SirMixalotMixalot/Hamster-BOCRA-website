# BOCRA Frontend

React + TypeScript frontend for the BOCRA website, built with Vite and shadcn/ui.

## Getting Started

```bash
cd Frontend
npm install
npm run dev
```

The app will be available at `http://localhost:8080`.

## Available Scripts

| Command            | Description                  |
| ------------------ | ---------------------------- |
| `npm run dev`      | Start the Vite dev server    |
| `npm run build`    | Production build             |
| `npm run preview`  | Preview the production build |
| `npm run lint`     | Run ESLint                   |
| `npm run test`     | Run tests                    |

## Sign-In (Temporary – No Auth)

Authentication is not wired yet. To access the portals:

1. Click **Sign In** on the landing page header.
2. Choose a role:
   - **Admin** → fill in any email/password → click **Sign In** → redirects to `/admin/dashboard`
   - **Customer** → fill in any email/password → click **Sign In** → redirects to `/customer/dashboard`
   - **Customer (Register)** → fill in the form → click **Create Account** → redirects to `/customer/dashboard`

No credentials are validated. This will be replaced with Supabase Auth.
