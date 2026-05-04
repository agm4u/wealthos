# WealthOS — Personal Finance Dashboard

Dark, beautiful personal finance tracker. Run locally with Docker Desktop with one click.

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

### Daily Use
```bash
# Start
docker compose up -d

# Stop
docker compose down
```

### Wipe and reset data
```bash
docker compose down -v   # -v removes the volume (deletes all data)
docker compose up --build
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
├── docker-compose.yml       ← docker compose file (all 3 services)
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

MF · FD · Bond · NPS · PPF · EPF · Gold · Shares · ETF · US · Crypto · Bank Accounts

## Disclaimer

WealthOS is an independent personal project built for private use.
It is not affiliated with, endorsed by, or associated with any
organization, company, product, or service that may share a similar
name, including any entity operating under the name "WealthOS" or
any of its subsidiaries, partners, or related brands.

All trademarks and registered trademarks are the property of their
respective owners.

This project is open source and provided as-is, with no warranties
of any kind. Use at your own risk.
