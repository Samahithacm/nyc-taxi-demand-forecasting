from datetime import datetime
from typing import List

from pydantic import BaseModel, ConfigDict, Field


class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int


class LoginRequest(BaseModel):
    username: str
    password: str


class PredictionRequest(BaseModel):
    zone_id: int = Field(ge=1, le=300)
    hour: int = Field(ge=0, le=23)
    day_of_week: int = Field(ge=0, le=6, description="0=Monday, 6=Sunday")


class PredictionResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    zone_id: int
    zone_name: str
    borough: str
    hour: int
    day_of_week: int
    day_name: str
    predicted_demand: float
    confidence_lower: float
    confidence_upper: float
    historical_avg: float
    vs_historical_pct: float
    demand_category: str
    explanation_factors: List[str]
    model_version: str
    timestamp: datetime


class Zone(BaseModel):
    id: int
    name: str
    borough: str
    latitude: float | None = None
    longitude: float | None = None
    total_demand: int
    rank: int


class ZonesResponse(BaseModel):
    zones: List[Zone]
    boroughs: List[str]
    total_zones: int


class HealthResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    status: str
    timestamp: datetime
    model_loaded: bool
    model_version: str
    uptime_seconds: float


class ErrorResponse(BaseModel):
    detail: str
    timestamp: datetime
