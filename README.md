# WealthOS — Personal Finance Dashboard

Dark, beautiful personal finance tracker. Run locally with Docker Desktop, deploy to Railway with one click.

---

## Run Locally (Docker Desktop)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Start the app

```bash
git clone https://github.com/agm4u/wealthos.git
cd wealthos
docker compose up --build
```

That's it. Open http://localhost:3000

- Frontend: http://localhost:3000
- API docs: http://localhost:8000/docs
- Default Password: wealthos2026

### Stop the app
```bash
docker compose down
```
Your data is safe — it lives in the `pgdata` Docker volume.

### Wipe and reset data
```bash
docker compose down -v   # -v removes the volume (deletes all data)
docker compose up --build
```

### Daily Use
```bash
# Start
docker compose up -d

# Stop
docker compose down
```

---

## Access from Phone (same WiFi)

Find your PC's local IP:
- Windows: `ipconfig` → look for IPv4 Address
- Mac: `ifconfig` or System Preferences → Network

Then open `http://192.168.x.x:3000` on your phone browser.

---

## Access from Anywhere (Tailscale)

1. Install [Tailscale](https://tailscale.com) on your PC and phone — free
2. Sign in with Google on both devices
3. Your PC gets a stable IP like `100.x.x.x`
4. Open `http://100.x.x.x:3000` from anywhere

---

## Deploy to Railway (One Click)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "initial"
git remote add origin https://github.com/YOUR_USERNAME/wealthos.git
git push -u origin main
```

### Step 2 — Create Railway project
1. Go to [railway.app](https://railway.app) → New Project
2. Choose "Deploy from GitHub repo" → select your repo
3. Railway auto-detects the Dockerfile

### Step 3 — Add PostgreSQL
1. In your Railway project → + New → Database → PostgreSQL
2. Railway auto-sets `DATABASE_URL` as an env variable

### Step 4 — Set environment variable
In your Railway service settings → Variables:
```
DATABASE_URL = (auto-set by Railway when you add Postgres)
```

### Step 5 — Deploy frontend
Create a second Railway service from the same repo:
- Root directory: `/frontend`
- It will use the frontend Dockerfile

Set env var:
```
VITE_API_URL = https://your-backend.railway.app
```

Your app is live at the Railway-provided URL.

---

## How editing works

- **Click any value** in the dashboard or investment tables → edit inline → press Enter or click away → saves to database immediately
- **Valuation date** — click it on the dashboard to edit
- **Add investments** — "+ Add Entry" button on any investment page
- **Delete** — ✕ button on each row
- **Monthly transfers** — editable on the dashboard, add/remove banks

---

## Project structure

```
wealthos/
├── docker-compose.yml       ← local dev (all 3 services)
├── railway.toml             ← Railway deploy config
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py          ← FastAPI routes
│       ├── database.py      ← SQLAlchemy models + seed data
│       └── schemas.py       ← Pydantic schemas
└── frontend/
    ├── Dockerfile           ← builds React → serves via nginx
    ├── nginx.conf           ← proxies /api to backend
    ├── src/
    │   ├── App.jsx          ← sidebar + routing
    │   ├── api/client.js    ← all API calls
    │   ├── components/
    │   │   └── shared.jsx   ← EditableCell, Modal, Tag, formatters
    │   └── pages/
    │       ├── Dashboard.jsx    ← charts, summary, transfers
    │       └── Investments.jsx  ← full CRUD table per category
    └── ...config files
```

---

## Categories

MF · FD · Bond · NPS · PPF · EPF · Gold · Shares · ETF · US · Crypto
