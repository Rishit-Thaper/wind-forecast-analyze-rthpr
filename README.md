# Wind Analytics

A focused UK national wind-generation forecast accuracy dashboard for January 2026. It compares Elexon BMRS WINDFOR forecasts available before a configurable day-ahead decision cutoff with FUELHH `WIND` outturn.

## Run with Docker

```bash
cp .env.example .env
docker compose up --build
```

Open `http://localhost:5173`. The API is available at `http://localhost:8000/api/health`.

## Local development

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

## Decision-cutoff assumption

The default is **12:00 UTC on the preceding calendar day**, configured by `DAY_AHEAD_CUTOFF_HOUR_UTC`. It is a transparent working assumption for this assessment, not a claim about the official GB day-ahead market gate closure. For each delivery half-hour, the service chooses the latest WINDFOR publication at or before that cutoff. All timestamps are normalized to UTC before matching.

## Elexon integration and resilience

The backend calls the official BMRS `WINDFOR/stream` and `FUELHH/stream` endpoints with their documented `publishDateTimeFrom` and `publishDateTimeTo` filters. It requests forecast publications from a configurable historical lookback so early-January delivery periods can use forecasts published in December. Results are cached on disk (six hours by default), with timeouts and clear 503 errors for network, rate-limit, malformed-response, and upstream errors. The UI never substitutes demonstration data if live data cannot be loaded.

## Metrics

All metrics use only matched valid pairs: MAE, RMSE, signed bias, and WAPE. Positive bias means over-forecasting. WAPE is unavailable when the actual-generation denominator is zero. These metrics do not estimate financial impact because no price data is included.

## Tests

```bash
cd backend && pytest
cd frontend && npm test
```
