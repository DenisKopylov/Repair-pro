# Repair Project

This monorepo contains a Next.js frontend and a Node.js backend.

## Environment variables

Before running the frontend, create an environment file:

1. Copy `.env.example` to `apps/frontend/.env.local`.
2. Fill in the values for your Firebase project and the backend `NEXT_PUBLIC_API_URL`.

The frontend will load these variables automatically via `process.env.NEXT_PUBLIC_*`.
