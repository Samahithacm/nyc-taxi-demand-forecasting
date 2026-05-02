# NYC Taxi Demand Forecasting API

FastAPI backend for serving NYC taxi demand predictions from the trained LightGBM artifacts and the pre-computed prediction lookup table.

## Setup

```bash
cd backend
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

On macOS/Linux, use `cp .env.example .env`.

The API expects `uvicorn` to be started from the `backend/` directory so the relative artifact paths in `.env` resolve correctly.

## URLs

- API info: `http://localhost:8000/`
- Health: `http://localhost:8000/api/health`
- Swagger UI: `http://localhost:8000/docs`

## Demo Credentials

- Username: `demo`
- Password: `demo123`

## Example Requests

Login:

```bash
curl -X POST http://localhost:8000/api/auth/login ^
  -H "Content-Type: application/x-www-form-urlencoded" ^
  -d "username=demo&password=demo123"
```

Authenticated prediction:

```bash
curl -X POST http://localhost:8000/api/predict ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"zone_id\":161,\"hour\":18,\"day_of_week\":4}"
```

Public prediction:

```bash
curl "http://localhost:8000/api/predict/public?zone_id=161&hour=18&day_of_week=4"
```

Zones:

```bash
curl http://localhost:8000/api/zones
```

## Configuration

Copy `.env.example` to `.env` and adjust:

- `SECRET_KEY`: at least 32 characters
- `ALLOWED_ORIGINS`: frontend origins, including `http://localhost:5173` and `http://127.0.0.1:5173`
- `MODEL_PATH`, `FEATURE_COLUMNS_PATH`, `ZONES_PATH`, `PREDICTION_LOOKUP_PATH`: relative artifact paths
- `RATE_LIMIT_PUBLIC`, `RATE_LIMIT_AUTHENTICATED`: SlowAPI rate limit strings
