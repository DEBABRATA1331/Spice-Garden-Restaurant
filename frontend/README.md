This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Vercel Deployment (Important)

If you see errors like:
- `Backend API is not configured...`
- Menu/admin requests returning `404` from `/api/...`

then your frontend deployment is missing backend env configuration.

### Why this happens

- `.env` files are **not automatically uploaded to Vercel**.
- Vercel uses environment variables configured in **Project Settings → Environment Variables**.

### Required frontend env vars (on Vercel)

Set at least one of these in the **frontend Vercel project**:

- `BACKEND_API_URL` (preferred)
- `NEXT_PUBLIC_API_URL` (fallback)

Value format should include `/api`, for example:

```env
BACKEND_API_URL=https://your-backend-domain.com/api
```

### Root Directory

For this repository layout, set Vercel **Root Directory** to:

```text
frontend
```

### After adding env vars

1. Save env vars in Vercel.
2. Redeploy the frontend (prefer "Redeploy with Clear Build Cache").

---

## Backend notes

If login still fails after backend is reachable, run seed on backend environment once:

```bash
npm run db:seed
```

Demo credentials:
- Admin: `admin@spicegarden.com / admin123`
- Waiter: `waiter@spicegarden.com / waiter123`
