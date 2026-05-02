import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import joblib

from .config import settings


class ModelService:
    """Loads model artifacts and serves cached realistic prediction scenarios."""

    def __init__(self) -> None:
        self.model: Any | None = None
        self.feature_columns: list[str] = []
        self.zones_data: dict[str, Any] = {"zones": [], "boroughs": []}
        self.prediction_lookup: dict[str, Any] = {"metadata": {}, "predictions": {}}
        self.model_version = "unknown"
        self.model_loaded = False
        self.load_error: str | None = None
        self._load_artifacts()

    def _resolve_path(self, value: str) -> Path:
        path = Path(value)
        if path.is_absolute():
            return path.resolve()
        return (Path.cwd() / path).resolve()

    def _load_artifacts(self) -> None:
        try:
            model_path = self._resolve_path(settings.MODEL_PATH)
            feature_columns_path = self._resolve_path(settings.FEATURE_COLUMNS_PATH)
            zones_path = self._resolve_path(settings.ZONES_PATH)
            prediction_lookup_path = self._resolve_path(settings.PREDICTION_LOOKUP_PATH)

            self.model = joblib.load(model_path)
            self.feature_columns = json.loads(feature_columns_path.read_text(encoding="utf-8"))
            self.zones_data = json.loads(zones_path.read_text(encoding="utf-8"))
            self.prediction_lookup = json.loads(prediction_lookup_path.read_text(encoding="utf-8"))
            self.model_version = self.prediction_lookup.get("metadata", {}).get(
                "model_version", "unknown"
            )
            self.model_loaded = True
            print(f"ModelService loaded model artifacts successfully: {self.model_version}")
        except Exception as exc:
            self.load_error = str(exc)
            self.model_loaded = False
            print(f"ModelService failed to load artifacts: {exc}")

    def get_zone_info(self, zone_id: int) -> dict[str, Any] | None:
        return next(
            (zone for zone in self.zones_data.get("zones", []) if int(zone.get("id")) == zone_id),
            None,
        )

    def _get_day_name(self, day_of_week: int) -> str:
        return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][
            day_of_week
        ]

    def predict(self, zone_id: int, hour: int, day_of_week: int) -> dict[str, Any]:
        if not self.model_loaded:
            raise RuntimeError(f"Model artifacts are not loaded: {self.load_error}")

        if not self.get_zone_info(zone_id):
            raise ValueError(f"Zone {zone_id} is not available in the top 20 modeled zones")

        predictions = self.prediction_lookup.get("predictions", {})
        keys = [f"{zone_id}_{hour}_{day_of_week}", f"{zone_id}{hour}{day_of_week}"]
        prediction = next((predictions[key] for key in keys if key in predictions), None)

        if prediction is None:
            raise ValueError(
                f"No cached prediction scenario found for zone={zone_id}, hour={hour}, "
                f"day_of_week={day_of_week}"
            )

        return {
            **prediction,
            "day_name": prediction.get("day_name") or self._get_day_name(day_of_week),
            "model_version": self.model_version,
            "timestamp": datetime.now(timezone.utc),
        }

    def get_zones(self) -> dict[str, Any]:
        if not self.model_loaded:
            raise RuntimeError(f"Model artifacts are not loaded: {self.load_error}")

        zones = self.zones_data.get("zones", [])
        return {
            "zones": zones,
            "boroughs": self.zones_data.get("boroughs", []),
            "total_zones": len(zones),
        }


model_service = ModelService()
