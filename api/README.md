# Agro-Weather Intelligence API

A backend service that integrates the [WeatherAI API](https://weather-ai.co) to deliver actionable weather intelligence for farms. Built for the WeatherAI Backend Engineer take-home assignment.

**Live demo:** `https://agro-weather-api.onrender.com`

---

## What it does

Farmers register their plots by name and coordinates. The service fetches current weather and 7-day forecasts from WeatherAI, caches results in PostgreSQL, and generates crop-aware agronomic advisories — flagging high-risk days for rainfall, wind, heat, and frost.

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/farms` | Register a farm |
| `GET` | `/farms` | List all farms |
| `GET` | `/farms/:id` | Get a farm |
| `DELETE` | `/farms/:id` | Delete a farm |
| `GET` | `/farms/:id/weather` | Current conditions (cached 30 min) |
| `GET` | `/farms/:id/forecast` | 7-day forecast (cached 30 min) |
| `GET` | `/farms/:id/advisory` | Agronomic advisory from forecast |
| `GET` | `/health` | DB + upstream quota status |

### Example: Register a farm

```bash
curl -X POST https://agro-weather-api.onrender.com/farms \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kapkimolwa Farm",
    "lat": -0.7833,
    "lon": 35.3667,
    "cropType": "tea",
    "location": "Bomet Central"
  }'
```

### Example: Get advisory

```bash
curl https://agro-weather-api.onrender.com/farms/<id>/advisory
```

Response:
```json
{
  "farmId": "clx...",
  "farmName": "Kapkimolwa Farm",
  "cropType": "tea",
  "generatedAt": "2026-06-05T08:00:00.000Z",
  "summary": "2 high-risk day(s) in the 7-day outlook. Review alerts carefully before planning field operations.",
  "advisory": [
    {
      "day": "2026-06-05",
      "condition": "Heavy Rain",
      "risk": "high",
      "advice": "Heavy rainfall expected — avoid field operations and delay fertiliser application."
    }
  ]
}
```

### Example: Health check

```json
{
  "status": "ok",
  "database": "connected",
  "upstream": {
    "plan": "free",
    "requests": { "used": 43, "limit": 1000, "remaining": 957 },
    "ai_requests": { "used": 0, "limit": 200, "remaining": 200 }
  }
}
```

---

## Architecture decisions

**Caching** — Weather responses are stored in PostgreSQL with a 30-minute TTL. This is intentional: the free plan has a 1,000 request/month limit. Multiple reads of the same farm's weather within 30 minutes hit the cache, not the upstream API.

**AI summaries disabled by default** — All upstream calls use `?ai=false`. The free plan includes only 200 AI requests/month. AI can be enabled per-request if a Pro key is provided.

**Quota-aware health endpoint** — `/health` reports upstream quota remaining. Usage stats are cached in-memory for 5 minutes so health pings don't themselves consume quota.

**Retry with exponential backoff** — WeatherAI 500/503 responses are retried up to 3 times with exponential delay (via `axios-retry`).

**Structured logging** — All requests and errors are logged with `pino`. In production, logs emit as JSON for ingestion by log aggregators.

---

## Local setup

### Prerequisites
- Node.js 20+
- Docker + Docker Compose
- A WeatherAI API key (free tier works)

### 1. Clone and install

```bash
git clone https://github.com/your-username/agro-weather-api
cd agro-weather-api
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Add your WEATHERAI_API_KEY to .env
```

### 3. Run with Docker Compose (recommended)

```bash
docker compose up --build
```

This starts the API on `http://localhost:3000` and a PostgreSQL instance.

### 4. Run locally (without Docker)

```bash
# Start Postgres separately, then:
npx prisma migrate dev
npm run dev
```

---

## Running tests

```bash
npm test
```

Tests cover the advisory service logic — risk assessment, crop-specific warnings, and summary generation — without requiring a live database or API key.

---

## Tech stack

| Concern | Choice |
|---------|--------|
| Runtime | Node.js 20 + TypeScript |
| Framework | Express |
| Database | PostgreSQL via Prisma ORM |
| HTTP client | Axios + axios-retry |
| Logging | Pino |
| Tests | Jest + ts-jest |
| Containerisation | Docker + Docker Compose |
| CI | GitHub Actions |
| Deployment | Render |

---

## Deployment (Render)

1. Push to GitHub
2. Create a new **Web Service** on Render, point to this repo
3. Set environment variables: `WEATHERAI_API_KEY`, `DATABASE_URL`
4. Render auto-detects the `Dockerfile` and builds on every push
