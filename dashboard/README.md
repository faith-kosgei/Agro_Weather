# Agro-Weather Dashboard

Next.js frontend for the [Agro-Weather Intelligence API](../agro-weather-api). Visualizes farm weather data, 7-day forecasts, and agronomic advisories.

**Live demo:** `https://agro-weather-dashboard.vercel.app`

---

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts (forecast chart)
- Lucide React (icons)

## Setup

```bash
cd agro-weather-dashboard
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL to your backend URL
npm run dev
```

Dashboard runs on `http://localhost:3000` (or 3000 if the API is not running).

## Features

- Register and manage farms with lat/lon coordinates
- View real-time weather conditions per farm
- Interactive 7-day forecast chart (temperature + rainfall)
- Colour-coded agronomic advisory with day-by-day risk indicators
- Quick-fill sample farms (Kenyan locations) for fast demo

## Deployment (Vercel)

1. Push to GitHub
2. Import into Vercel
3. Set `NEXT_PUBLIC_API_URL` to your Render backend URL
4. Deploy
