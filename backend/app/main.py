import logging
import time
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone

from fastapi import Depends, FastAPI, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi import _rate_limit_exceeded_handler
from starlette.exceptions import HTTPException as StarletteHTTPException

from .auth import authenticate_user, create_access_token, get_current_user_required
from .config import settings
from .ml_model import model_service
from .models import HealthResponse, PredictionRequest, PredictionResponse, Token, ZonesResponse
from .rate_limit import limiter

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("nyc-taxi-api")
APP_START_TIME = time.time()


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info("Starting NYC Taxi Demand Forecasting API")
    yield
    logger.info("Shutting down NYC Taxi Demand Forecasting API")


app = FastAPI(
    title="NYC Taxi Demand Forecasting API",
    description=(
        "Production-ready API for NYC taxi demand predictions with JWT authentication, "
        "rate limiting, model health checks, and cached LightGBM scenario predictions. "
        "Demo credentials: demo/demo123."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    logger.info(
        "%s %s -> %s %.2fms",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(_: Request, exc: StarletteHTTPException):
    payload = {"detail": exc.detail, "timestamp": datetime.now(timezone.utc).isoformat()}
    return JSONResponse(status_code=exc.status_code, content=payload)


@app.get("/", tags=["Info"])
async def api_info():
    return {
        "name": "NYC Taxi Demand Forecasting API",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_url": "/api/health",
    }


@app.get("/api/health", response_model=HealthResponse, tags=["Info"])
async def health():
    return {
        "status": "healthy" if model_service.model_loaded else "degraded",
        "timestamp": datetime.now(timezone.utc),
        "model_loaded": model_service.model_loaded,
        "model_version": model_service.model_version,
        "uptime_seconds": round(time.time() - APP_START_TIME, 3),
    }


@app.post("/api/auth/login", response_model=Token, tags=["Authentication"])
@limiter.limit("5/minute")
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    del request
    if not authenticate_user(form_data.username, form_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": form_data.username}, expires_delta=expires_delta)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }


@app.get("/api/zones", response_model=ZonesResponse, tags=["Zones"])
@limiter.limit(settings.RATE_LIMIT_PUBLIC)
async def get_zones(request: Request):
    del request
    try:
        return model_service.get_zones()
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc


@app.post("/api/predict", response_model=PredictionResponse, tags=["Predictions"])
@limiter.limit(settings.RATE_LIMIT_AUTHENTICATED)
async def predict(
    request: Request,
    payload: PredictionRequest,
    username: str = Depends(get_current_user_required),
):
    del request
    try:
        logger.info(
            "Authenticated prediction requested by %s: zone=%s hour=%s day_of_week=%s",
            username,
            payload.zone_id,
            payload.hour,
            payload.day_of_week,
        )
        return model_service.predict(payload.zone_id, payload.hour, payload.day_of_week)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Prediction request failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Prediction failed",
        ) from exc


@app.get("/api/predict/public", response_model=PredictionResponse, tags=["Predictions"])
@limiter.limit(settings.RATE_LIMIT_PUBLIC)
async def predict_public(
    request: Request,
    zone_id: int = Query(ge=1, le=300),
    hour: int = Query(ge=0, le=23),
    day_of_week: int = Query(ge=0, le=6),
):
    del request
    try:
        return model_service.predict(zone_id, hour, day_of_week)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Public prediction request failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Prediction failed",
        ) from exc
