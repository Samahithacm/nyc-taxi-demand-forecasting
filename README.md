# NYC Taxi Demand Forecasting with Adaptive MLOps Pipeline

## Demo Video

Watch our 10-minute project walkthrough explaining the system architecture, ML pipeline, drift detection, and full-stack implementation.

[![NYC Taxi Demand Forecasting Demo](https://img.youtube.com/vi/-3Jlx_Up2IE/maxresdefault.jpg)](https://youtu.be/-3Jlx_Up2IE)

Direct link: https://youtu.be/-3Jlx_Up2IE

## Overview

An end-to-end MLOps system for forecasting NYC taxi demand with drift detection, adaptive retraining, and a full-stack web application. The project combines a production-oriented machine learning pipeline, a FastAPI model-serving backend, and a React frontend for predictions, monitoring, and model analysis.


## Key Features

- LightGBM forecasting model achieving 22.78% test sMAPE, 46.10% better than naive baselines
- Drift detection using PSI and KS-test
- Adaptive retraining with 8 retrain events during a 60-day production simulation
- Statistical validation showing 4.61% improvement (p=0.0118)
- Full-stack application with React 19 frontend and FastAPI backend with JWT authentication

## Results Summary

| Metric | Result |
|---|---|
| Best Model | LightGBM |
| Test sMAPE | 22.78% |
| Improvement over baseline | 46.10% |
| Static vs Adaptive improvement | 4.61% (p=0.0118) |
| Total trips processed | 9,554,757 |
| Zones covered | 20 (top 63.05% of demand) |
| Features engineered | 30+ |
| Retrain events in simulation | 8 |

## Architecture

The project is organized into three layers:

- **ML Pipeline (5 Notebooks):** Data processing, feature engineering, model training, drift simulation, and data export.
- **FastAPI Backend (Port 8000):** JWT authentication, rate limiting, and model serving.
- **React Frontend (Port 5173):** Six interactive pages for forecasting, analysis, monitoring, and model details.

## Getting Started

### Prerequisites

- Python 3.11
- Node.js 18+
- Git

### Clone

```bash
git clone https://github.com/Samahithacm/nyc-taxi-demand-forecasting.git
cd nyc-taxi-demand-forecasting
```

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
copy .env.example .env
```

On macOS or Linux, use:

```bash
cp .env.example .env
```

### Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

### Terminal 1: Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

Visit:

- Frontend: http://localhost:5173
- API Docs: http://localhost:8000/docs
- Default credentials: `demo` / `demo123`

## Methodology

### Data Pipeline

The pipeline uses NYC TLC Yellow Taxi data, processing 9.5M trips into 240,917 hourly observations across the top 20 pickup zones. These zones represent the highest-demand areas and cover 63.05% of total demand.

### Feature Engineering

The model uses 30+ engineered features, including:

- Lag features: 1h, 2h, 3h, 24h, and 168h
- Rolling statistics for short-term and weekly demand patterns
- Temporal features such as hour, day of week, weekend, and holiday-style calendar signals
- Cyclical encoding for periodic time features
- Zone-level features for location-specific demand behavior

### Models Compared

| Model | Test sMAPE | Notes |
|---|---:|---|
| Naive Last Hour | 52.56% | Baseline |
| Seasonal Naive 24h | 51.62% | Daily seasonal baseline |
| Moving Average | 50.21% | Rolling average baseline |
| LightGBM | 22.78% | Selected model |
| XGBoost | 23.45% | Strong alternative |

## MLOps Pipeline

### Drift Detection Methods

- PSI with threshold 0.2
- KS-test with p-value threshold 0.05

### Retrain Triggers

Retraining is triggered when any of the following conditions are met:

- 7-day rolling sMAPE is at least 20% above baseline for 3+ consecutive days
- PSI > 0.2 for 3+ features
- KS-test p-value < 0.05 for 3+ features

### Constraints

- Minimum 7 days between retrains
- Maximum 4 retrains per month

## Production Simulation Results

- Reference period: Jan 1-30, 2024 (training)
- Simulation period: Feb 1 - Mar 31, 2024 (8 weeks)
- Comparison: Static model vs adaptive retraining pipeline
- Result: 4.61% improvement with statistical significance (p=0.0118)

The simulation showed that adaptive retraining improved model performance over the static model while respecting retraining constraints and avoiding excessive retrain frequency.

## Frontend Features

- Dashboard - KPI overview
- Live Prediction - On-demand predictions
- Forecast Explorer - Historical analysis with date filtering
- Zone Analysis - Interactive NYC map
- Model Details - Architecture and performance
- Monitoring - Drift detection and retrain timeline

## Backend Features

- JWT Authentication with bcrypt
- Rate limiting: 10/min public, 60/min authenticated
- CORS configuration
- Auto-generated OpenAPI docs at `/docs`
- Graceful fallback to static JSON
- Request logging

## API Endpoints

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| GET | `/` | No auth | API info |
| GET | `/api/health` | No auth | Health check |
| POST | `/api/auth/login` | No auth | Get JWT token |
| GET | `/api/zones` | No auth | List taxi zones |
| GET | `/api/predict/public` | No auth | Public prediction (10/min) |
| POST | `/api/predict` | Auth required | Authenticated prediction (60/min) |

## Tech Stack

### ML/Data

- Python 3.11
- pandas
- numpy
- LightGBM
- XGBoost
- scipy

### Backend

- FastAPI 0.109
- Pydantic v2
- python-jose (JWT)
- slowapi (rate limiting)
- joblib

### Frontend

- React 19
- Vite 8
- Tailwind CSS v4
- Recharts
- Leaflet
- react-leaflet
- lucide-react

## Project Structure

```text
.
├── backend/     # FastAPI Server
├── frontend/    # React Application
├── notebooks/   # 5 Jupyter notebooks
├── models/      # Trained models
└── data/        # Raw and processed data
```

## Notebooks

- `preliminary_data_visualizations.ipynb` - Initial EDA and baselines
- `02_ml_modeling.ipynb` - LightGBM training and evaluation
- `03_drift_and_retrain.ipynb` - Drift detection and production simulation
- `04_export_for_frontend.ipynb` - Data export to JSON
- `05_generate_prediction_lookup.ipynb` - Pre-compute prediction scenarios

## Future Improvements

- Multi-horizon forecasting
- Weather data integration
- Spatial features
- Ensemble models
- Real-time data pipeline
- Cloud deployment

## Team

- Samahitha CM
- Ankith
- Priyanshu Bansal

## Acknowledgments

- NYC Taxi & Limousine Commission
- Boston University Data Science course staff
