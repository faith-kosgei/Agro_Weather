# Agro-Weather Intelligence

> WeatherAI Backend Engineer take-home assignment  
> Built by **Faith Kosgei**

A monorepo containing a farm-focused weather intelligence backend API and a Next.js dashboard — both powered by the [WeatherAI API](https://weather-ai.co).

**Live API:** `https://agro-weather-api.onrender.com`  
**Live Dashboard:** `https://agro-weather-dashboard.vercel.app`

---

## Repository structure

```
agro-weather/
├── api/          # Node.js + TypeScript backend (Express + PostgreSQL)
└── dashboard/    # Next.js frontend dashboard
```

---

## Quick start (both apps together)

```bash
git clone https://github.com/your-username/agro-weather
cd agro-weather

# Install all dependencies
npm install
npm install --prefix api
npm install --prefix dashboard

# Copy and fill env files
cp api/.env.example api/.env
cp dashboard/.env.example dashboard/.env.local
# → Add WEATHERAI_API_KEY to api/.env

# Run both with one command (requires Docker for the database)
cd api && docker compose up --build -d && cd ..
npm run dev
```

- API runs on `http://localhost:3000`
- Dashboard runs on `http://localhost:3001`

---

## API (`/api`)

A RESTful backend that integrates WeatherAI to deliver actionable weather data for registered farms.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/farms` | Register a farm |
| `GET` | `/farms` | List all farms |
| `GET` | `/farms/:id` | Get a farm |
| `DELETE` | `/farms/:id` | Delete a farm |
| `GET` | `/farms/:id/weather` | Current conditions (cached 30 min) |
| `GET` | `/farms/:id/forecast` | 7-day forecast (cached 30 min) |
| `GET` | `/farms/:id/advisory` | Crop-aware agronomic advisory |
| `GET` | `/health` | DB connectivity + upstream quota status |

### Example — register a farm

```bash
curl -X POST http://localhost:3000/farms \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kapkimolwa Tea Farm",
    "lat": -0.7833,
    "lon": 35.3667,
    "cropType": "tea",
    "location": "Bomet Central"
  }'
```

### Example — get advisory

```bash
curl http://localhost:3000/farms/<id>/advisory
```

```json
{
  "farmName": "Kapkimolwa Tea Farm",
  "summary": "2 high-risk day(s) in the 7-day outlook.",
  "advisory": [
    {
      "day": "2026-06-06",
      "condition": "Heavy Rain",
      "risk": "high",
      "advice": "Heavy rainfall expected — avoid field operations and delay fertiliser application."
    }
  ]
}
```

### Key design decisions

**Caching** — Weather responses are persisted in PostgreSQL with a 30-minute TTL. The free WeatherAI plan allows 1,000 requests/month; caching ensures repeated reads of the same farm don't exhaust quota.

**AI summaries off by default** — All upstream calls use `?ai=false`. The free plan includes only 200 AI requests/month, preserved for opt-in use.

**Quota-aware health endpoint** — `/health` reports upstream quota remaining. Usage stats are cached in memory for 5 minutes so health pings don't consume quota themselves.

**Retry with exponential backoff** — WeatherAI 500/503 responses are retried up to 3 times (via `axios-retry`).

**Structured logging** — All requests and errors logged with `pino`; JSON in production for log aggregator ingestion.

### Tech stack

| Concern | Choice |
|---------|--------|
| Runtime | Node.js 20 + TypeScript |
| Framework | Express |
| Database | PostgreSQL via Prisma ORM |
| HTTP client | Axios + axios-retry |
| Logging | Pino |
| Tests | Jest + ts-jest |
| Container | Docker + Docker Compose |

---

## Dashboard (`/dashboard`)

A Next.js 14 dashboard that visualises farm weather data from the API.

**Features:**
- Register and manage farms
- Current conditions (temperature, humidity, wind, UV)
- Interactive 7-day forecast chart (temperature range + rainfall)
- Colour-coded agronomic advisory with day-by-day risk indicators

### Tech stack

| Concern | Choice |
|---------|--------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |

---

## CI/CD

GitHub Actions runs on every push to `main`:
- API: type check → lint → unit tests
- Dashboard: lint

Deployment:
- API → [Render](https://render.com) (Docker, auto-deploys on push)
- Dashboard → [Vercel](https://vercel.com) (auto-deploys on push)

---

## Running tests

```bash
cd api && npm test
```
