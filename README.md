# CareTrack Clinic — Medical Record Management System

Full-stack MRMS with React, Tailwind, Express, SQLite, and JWT authentication.

## Prerequisites

- Node.js 18+
- npm

## Quick start

### 1. Backend

```bash
cd server
npm install
copy .env.example .env
npm run db:init
npm run dev
```

API: `http://localhost:5000`  
Demo accounts (password `password123`):

- `admin@caretrack.local`
- `clinician@caretrack.local`
- `reception@caretrack.local`

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

App: `http://localhost:5173`

The Vite dev server proxies `/api` to the backend.

## Project layout

- `client/` — React (Vite) + Tailwind UI
- `server/` — Express API, JWT, RBAC middleware
- `database/schema.sql` — SQLite DDL
- `database/seed.sql` — sample doctors, patients, diseases, records
- `server/scripts/init-db.js` — creates SQLite file, hashes user passwords, loads schema + seed

## Production notes

- Set a strong `JWT_SECRET` in `server/.env`.
- For PostgreSQL, replace `better-sqlite3` with `pg`, adjust SQL types, and point `DATABASE_URL` at your instance.
- Build the client with `npm run build` in `client/` and serve `dist/` behind your reverse proxy.

## Role access (summary)

| Capability            | Admin | Clinician | Receptionist |
|-----------------------|-------|-----------|--------------|
| User management       | Yes   | No        | No           |
| Doctor CRUD            | Yes   | View      | View         |
| Patients / register   | Yes   | Yes       | Yes          |
| Medical records       | Yes   | Yes       | No           |
| Diseases / ICD        | Yes   | Yes       | No           |

Receptionists see patient demographics but not medical history in the API/UI.
