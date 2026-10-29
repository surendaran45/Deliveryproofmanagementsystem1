# Delivery Proof Management System

A full-stack delivery workflow application with warehouse and delivery photo proof, GPS capture, OTP verification, and role-based driver/admin dashboards.

## Features

- Driver workflow: record warehouse pickup, capture GPS coordinates, enter the delivery address, and complete a delivery with photo and location proof.
- Delivery verification: generate and verify a six-digit delivery OTP.
- Admin workflow: review deliveries, inspect proof, and mark deliveries resolved or disputed.
- Delivery history and status-based dashboard summaries.

## Technology

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router, component libraries.
- **Backend:** Supabase Edge Functions using Hono.
- **Data and auth:** Supabase PostgreSQL, bcrypt password hashing, JWT bearer tokens.
- **Browser APIs:** Geolocation and image/file input.

## Repository layout

- `src/` — React application, pages, components, and client services.
- `supabase/functions/server/` — Edge Function API.
- `supabase/DATABASE_SETUP.md` — database schema and setup notes.
- `DEPLOYMENT_GUIDE.md` — deployment walkthrough.
- `TESTING_CHECKLIST.md` — manual end-to-end test checklist.

## Local frontend development

Prerequisites: Node.js 20 LTS or a currently supported LTS release, npm, and a Supabase project configured for the Edge Function.

```bash
npm install
npm run dev
```

Use the URL printed by Vite. To create a production build:

```bash
npm run build
```

## Supabase configuration

Configure these values in Supabase Edge Function secrets/settings. Never put service-role keys or JWT secrets in frontend environment variables or commit them to Git. The server now fails to start if any required server secret is missing. Public registration is restricted to driver accounts; provision admin accounts through a trusted operator workflow, not public signup.

- `SUPABASE_URL` — project URL.
- `SUPABASE_SERVICE_ROLE_KEY` — server-side service role key, only for the Edge Function.
- `JWT_SECRET` — a long, random, private secret. The deployed server must not use a fallback/default secret.

Run the database instructions in `supabase/DATABASE_SETUP.md`, then deploy the Edge Function using the Supabase CLI or dashboard. Follow `DEPLOYMENT_GUIDE.md` for the remaining steps.

## API

The Edge Function exposes authentication and delivery endpoints under the `/make-server-cca17b23` prefix. See `supabase/functions/server/index.tsx` for the current route definitions.

## Testing and CI

The manual workflow checklist is in `TESTING_CHECKLIST.md`. GitHub Actions runs the frontend production build on pushes to `main` and this improvement branch, and on pull requests targeting `main`.

```bash
npm install
npm run build
```

## Production security notes

This project handles personal data, delivery locations, photographs, credentials, and OTPs. Do not deploy it as-is for real deliveries until the security items in [SECURITY.md](SECURITY.md) are resolved. In particular, verify Row Level Security policies, prevent public self-registration as an administrator, remove development secrets/defaults, restrict CORS to trusted origins, and review OTP generation, storage, exposure, expiry, and attempt limits.

Use synthetic test accounts and non-sensitive sample data while developing. Never commit real credentials or customer delivery evidence.
