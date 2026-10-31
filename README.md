# Wind Analytics

A day-ahead wind forecast accuracy dashboard for a UK utility's power-purchasing team. For purchase decisions made in January 2026, it shows which Elexon BMRS WINDFOR forecast was available when the day-ahead auction closed. It then compares that forecast with actual national wind generation (FUELHH `WIND`) and quantifies the error, so buyers can size the extra power they need to procure.

**Live app:** _TODO: add the deployed Vercel/Heroku URL_

## What the dashboard answers

1. **What was the latest forecast available at decision time?** The Daily Analysis page shows, for any delivery day, when the decision was made and which WINDFOR publication was used. It also shows the forecast lead time and an hour-by-hour forecast vs actual table.
2. **How accurate is that forecast, quantitatively?** The Monthly Overview page reports:
   - MAE, RMSE, bias and WAPE.
   - The error distribution (P10 / P50 / P90).
   - Error by forecast wind level, the band a buyer would use to size a buffer.
   - Error by delivery hour.
   - A "value of waiting" table comparing every WINDFOR publication on the day before delivery.

### January 2026 findings

| Metric (forecast at 09:20 UTC gate closure) | Value |
|---|---|
| Mean absolute error | 2,039 MW |
| Bias (forecast − actual) | +1,748 MW: forecasts overstate delivered wind |
| P90 shortfall | 4,098 MW: in 9 hours out of 10, actual wind was no more than this below forecast |
| Bias when forecast ≥ 15 GW | +2,683 MW: the windiest days carry the most shortfall risk |
| Coverage | 744 / 744 delivery hours matched |

Bias stays at about +1.6 GW even for forecasts published late on the day before delivery. So the gap is systematic, not a forecast-horizon effect. Likely causes are curtailment and the scope difference between WINDFOR and metered FUELHH wind.

## Methodology

- **Decision window:** decisions made 1–31 January 2026, so delivery days run from **2 January to 1 February 2026**. The decision for 1 January was made on 31 December and is excluded.
- **Decision cutoff:** **09:20 UTC on the day before delivery**, the EPEX GB day-ahead (hourly) auction gate closure. UK time equals UTC in January. Nord Pool N2EX closes at 09:50. The cutoff is configurable through `DAY_AHEAD_CUTOFF_UTC`.
- **Forecast selection:** for each delivery hour, the latest WINDFOR publication at or before the cutoff. In practice this is the 07:30 UTC run.
- **Resolution:** WINDFOR is published hourly, while FUELHH is half-hourly. Each hour's actual is the mean of its two settlement periods. An hour missing either half-hour is excluded from metrics and reported under coverage.
- **Sign convention:** error = forecast − actual. Positive error means actual wind fell short of the forecast, which is the risk for a buyer.
- **Timestamps:** everything is normalised to UTC before pairing.
- **No price data:** metrics are in MW and do not estimate financial impact.

## Running the application

### With Docker

```bash
cp .env.example .env
docker compose up --build
```

Open http://localhost:5173. The API is at http://localhost:8000/api/health and the interactive docs are at http://localhost:8000/docs.

### Local development

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` to `localhost:8000`.

### Configuration

| Variable | Default | Purpose |
|---|---|---|
| `DAY_AHEAD_CUTOFF_UTC` | `09:20` | Latest forecast publication time (HH:MM UTC, day before delivery) |
| `ELEXON_TIMEOUT_SECONDS` | `30` | Timeout for Elexon BMRS requests |
| `ELEXON_CACHE_TTL_SECONDS` | `21600` | How long downloaded Elexon data is reused from disk |
| `FORECAST_LOOKBACK_DAYS` | `31` | How far before January WINDFOR publications are fetched |
| `ELEXON_CACHE_DIR` | `backend/.cache` | Disk cache location |
| `CORS_ORIGINS` | localhost origins | Comma-separated or JSON list of allowed frontend origins |
| `VITE_API_BASE_URL` | empty (same origin) | Frontend build-time API base URL for split deployments |

## API

| Endpoint | Description |
|---|---|
| `GET /api/health` | Liveness check |
| `GET /api/overview` | Window-level metrics, coverage, daily MAE, error by hour and forecast level, value of waiting |
| `GET /api/daily?date=YYYY-MM-DD` | Hourly comparison and decision context for one delivery day (2026-01-02 to 2026-02-01) |

## Repository structure

```
.
├── backend/                     Python 3.13 FastAPI service
│   ├── app/
│   │   ├── main.py              App factory: CORS, error handlers, routers
│   │   ├── api/
│   │   │   ├── router.py        Mounts all routes under /api
│   │   │   ├── deps.py          Dependency injection for the Elexon client and analytics service
│   │   │   └── routes/          health.py and analytics.py (/overview, /daily)
│   │   ├── core/
│   │   │   ├── config.py        Settings (env vars), decision window, gate-closure cutoff
│   │   │   └── errors.py        ElexonError mapped to HTTP 503
│   │   ├── services/
│   │   │   ├── elexon.py        BMRS WINDFOR/FUELHH stream client with retries and disk cache
│   │   │   └── analysis.py      Pure functions: forecast selection, hourly pairing, metrics, breakdowns
│   │   ├── schemas/analytics.py Pydantic response models
│   │   └── analysis.py, config.py, schemas.py   Backward-compatible re-exports
│   ├── tests/                   pytest unit tests (analysis) and API tests (FastAPI TestClient)
│   ├── main.py                  Root entrypoint re-exporting the app
│   ├── Dockerfile               Uvicorn image, listens on $PORT (default 8000)
│   ├── requirements.txt
│   └── ruff.toml                Lint configuration
├── frontend/                    React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── App.tsx              Page switching, loading and error states
│   │   ├── pages/               Overview.tsx (monthly) and DailyDetail.tsx (per delivery day)
│   │   ├── components/
│   │   │   ├── overview/        Headline metrics, daily chart, forecast-level, value-of-waiting, hour-of-day, coverage
│   │   │   ├── daily/           Daily header, metrics, chart, largest misses, decision context, hourly table
│   │   │   ├── layout/          Top bar and footer
│   │   │   ├── skeletons/       Loading placeholders
│   │   │   └── Charts.tsx       Recharts line charts
│   │   ├── hooks/useAnalytics.ts   TanStack Query hooks
│   │   ├── services/api.ts      Typed API client (+ api.test.ts, Vitest)
│   │   ├── types/               API and UI types
│   │   ├── constants/, utils/   Date range, formatters, date helpers
│   │   └── styles.css           Design tokens (light/dark) and component styles
│   ├── Dockerfile               Multi-stage build served by nginx
│   ├── nginx.conf               Serves the SPA and proxies /api to the backend container
│   └── vercel.json              Vercel SPA build and rewrites
├── docker-compose.yml           Backend + frontend, with a persistent Elexon cache volume
├── .env.example                 Configuration template
├── pytest.ini, pyrightconfig.json   Run tests and type checking from the repo root
└── README.md
```

## Tests and linting

```bash
cd backend && pytest && ruff check .
cd frontend && npm test && npm run lint && npm run typecheck
```

## Deployment

- **Frontend:** Vercel, using `frontend/vercel.json`. Set `VITE_API_BASE_URL` to the backend URL at build time.
- **Backend:** the Docker image reads `$PORT`, so it runs on Heroku's container stack or any Docker host. Set `CORS_ORIGINS` to the frontend origin. `*.vercel.app` origins are allowed by default.

## AI tools used

- **Claude Code** (Anthropic) was used to write the Python FastAPI backend code.
- AI tools were used for design inspiration for the dashboard UI.
- Claude Code was also used to review the app against the brief. It implemented the final round of fixes: the gate-closure cutoff, hourly forecast/actual matching, the January decision window, error-distribution views, and the related React components.
