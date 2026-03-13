### Fraction Interview Project

Full‑stack baseball stats app:

- **Backend**: Node + Express + Prisma + Postgres (`backend/`)
- **Frontend**: Next.js App Router (`frontend/`)
- **Data**: Baseball player statistics imported from `https://api.hirefraction.com/api/test/baseball`

The flow is:

1. Start Postgres.
2. Run Prisma migrations.
3. Import the baseball data into the DB.
4. Start the backend API.
5. Start the frontend UI.

---

### Prerequisites

- Node 20+
- `pnpm` (repo uses `pnpm@10.27.0`)
- **Docker** used to run Postgres via the helper scripts
- Alternatively: your own Postgres instance, if you prefer not to use Docker

---

### 1. Start Postgres

The recommended way is via Docker using the provided script.  
From the repo root:

```bash
./scripts/start-db.sh
```

To stop it later:

```bash
./scripts/stop-db.sh
```

---

### 2. Configure environment variables

#### Backend

Create `backend/.env` (or copy from the example if present):

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and set:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME
PORT=4000
```

#### Frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

---

### 3. Install dependencies

From the repo root:

```bash
cd backend
pnpm install

cd ../frontend
pnpm install
```

---

### 4. Run Prisma migrations

In `backend/`:

```bash
cd backend
pnpm prisma migrate dev
```

This will create/update the tables in your Postgres database according to `backend/prisma/schema.prisma`.

---

### 5. Import the baseball data

In `backend/`:

```bash
cd backend
pnpm import:baseball
```

This will:

- Fetch stats from `https://api.hirefraction.com/api/test/baseball` (or fall back to `data/data.json`).
- Map each record into the `Player` table.
- Upsert by player name so it is safe to run multiple times.

---

### 6. Run the backend API

In `backend/`:

```bash
cd backend
pnpm dev
```

The backend runs on `http://localhost:4000` by default and exposes:

- `GET /health`
- `GET /api/players?sortBy=...&sortOrder=...`
- `GET /api/players/:id`
- `PUT /api/players/:id`

You can quickly test it with:

```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/players?sortBy=homeRuns&sortOrder=desc
```

---

### 7. Run the frontend

In `frontend/`:

```bash
cd frontend
pnpm dev
```

Open `http://localhost:3000` in your browser.

You should see:

- A table of baseball players.
- Clickable column headers to sort by each stat.
- Inline editing of a player’s stats via an **Edit** button per row.

All data is loaded and saved through the Express backend.

---

### 8. Useful scripts

#### Backend (`backend/`)

- **`pnpm dev`** – run the Express API in dev mode.
- **`pnpm build` / `pnpm start`** – build and run the compiled server.
- **`pnpm prisma migrate dev`** – run Prisma migrations.
- **`pnpm prisma generate`** – regenerate Prisma client.
- **`pnpm import:baseball`** – (re)import baseball stats into Postgres.

#### Frontend (`frontend/`)

- **`pnpm dev`** – run the Next.js dev server.
- **`pnpm build` / `pnpm start`** – build and run in production mode.
- **`pnpm lint`** – run ESLint.

---

### 9. Typical dev workflow

1. `./scripts/start-db.sh`
2. Configure `backend/.env` and `frontend/.env.local`.
3. In `backend/`: `pnpm install`, `pnpm prisma migrate dev`, `pnpm import:baseball`, `pnpm dev`.
4. In `frontend/`: `pnpm install`, `pnpm dev`.
5. Open `http://localhost:3000` and iterate.
