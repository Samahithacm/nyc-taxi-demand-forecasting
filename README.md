# NYC Taxi Demand Forecasting with Adaptive MLOps Pipeline

## Project Description

This project develops a production-grade machine learning system for forecasting hourly taxi demand across NYC taxi zones. Unlike traditional one-time models, this project simulates a complete MLOps pipeline with automated monitoring, drift detection, and model retraining capabilities.

The system predicts taxi demand one hour ahead for each pickup zone, enabling taxi companies to optimize driver distribution and reduce customer wait times. The key innovation is demonstrating **when and why model retraining matters** by comparing a static model (trained once) against an adaptive model (retrained based on drift signals).

## Project Timeline (8 Weeks)

| Week | Milestone |
|------|-----------|
| 1-2 | Data collection, cleaning, and exploratory analysis |
| 3-4 | Feature engineering, baseline models, and ML model training |
| 5-6 | Monitoring infrastructure and drift detection implementation |
| 7 | Production simulation (static vs adaptive comparison) |
| 8 | Interactive dashboard, documentation, and final report |

## Project Goals

### Primary Goals

1. **Accurate Demand Forecasting**: Achieve MAPE < 25% on test data, outperforming naive baselines by at least 30%

2. **Demonstrate Adaptive Learning Value**: Show ≥10% error reduction of adaptive model over static model during drift periods with statistical significance (p < 0.05)

3. **Automated Drift Detection**: Implement monitoring system that detects distribution shifts and triggers retraining within 24 hours of performance degradation


### Secondary Goals 

- Zone-specific analysis (Manhattan vs outer boroughs, rush hour vs off-peak)
- Weather integration for improved accuracy during adverse conditions
- Interactive Streamlit dashboard for exploring predictions and drift alerts
- Demand spike explainability using historical pattern retrieval

## Data Collection Plan

### Primary Data Source

**NYC Taxi & Limousine Commission (TLC) Trip Record Data**
- **URL**: https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page
- **Alternative**: AWS Open Data Registry (https://registry.opendata.aws/nyc-tlc-trip-records-pds/)
- **Format**: Parquet files (compressed, ~3-4 GB for 3 months)
- **Scope**: Yellow Taxi data, January-March 2024 (30-50 million trip records)


### Supporting Data

**Taxi Zone Lookup**: https://d37ci6vzurychx.cloudfront.net/misc/taxi+_zone_lookup.csv (maps LocationID to borough/zone)

**Weather Data**: NOAA ISD for temperature, precipitation, snow

### Data Processing

Aggregate trips to hourly demand per zone, create complete time grid (fill missing with 0), drop invalid records, validate ranges, store as Parquet.

## Modeling Plan

**Target Variable**: Number of taxi pickups in next hour for each zone (1-hour ahead forecasting)

**Features**: Temporal (hour, day of week, holidays), lag features (1h, 24h, 168h ago), rolling stats (mean/std over 6h, 24h, 7d), zone attributes

**Models**: Baselines (naive, seasonal naive, ARIMA, Prophet), Primary (LightGBM), Alternative (XGBoost)

**Evaluation**: Time-series split 70/15/15, Metrics: MAPE < 25%, RMSE, sMAPE

## Monitoring & Production Simulation

**Drift Detection**:
- PSI (Population Stability Index) for feature distribution shifts
- KS-test for statistical significance
- Monitor top 5 important features weekly

**Retrain Triggers**:
- Rolling MAPE increases ≥20% for 3+ days
- PSI > 0.2 for 3+ features
- Minimum 7 days between retrains
