"""
Pydantic schemas for API request/response validation.
"""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field


# -------------------------------------------------------------------------
# Prediction schemas
# -------------------------------------------------------------------------
class PredictionRequest(BaseModel):
    """Request schema for anomaly prediction.

    Accepts feature array for immediate prediction or raw signal data
    that will be processed into features.
    """
    features: List[List[float]] = Field(
        ...,
        description="Feature array of shape (n_samples, n_features)",
        min_length=1,
    )

    class Config:
        json_schema_extra = {
            "example": {
                "features": [
                    [0.1, 0.2, 0.3] + [0.0] * 27,  # 30 features total
                ]
            }
        }


class AnomalyPrediction(BaseModel):
    """Single anomaly prediction result."""
    sample_index: int = Field(..., description="Sample index in batch")
    ensemble_score: float = Field(..., description="Ensemble anomaly score [0,1]")
    alert_level: Literal["normal", "warning", "critical"] = Field(
        ..., description="Alert severity level"
    )
    is_anomaly: bool = Field(..., description="Binary anomaly flag")
    individual_scores: dict = Field(
        ..., description="Scores from individual models"
    )


class PredictionResponse(BaseModel):
    """Response schema for anomaly prediction."""
    predictions: List[AnomalyPrediction] = Field(
        ..., description="List of predictions for each sample"
    )
    summary: dict = Field(..., description="Batch summary statistics")

    class Config:
        json_schema_extra = {
            "example": {
                "predictions": [
                    {
                        "sample_index": 0,
                        "ensemble_score": 0.25,
                        "alert_level": "normal",
                        "is_anomaly": False,
                        "individual_scores": {
                            "autoencoder": 0.15,
                            "isolation_forest": 0.20,
                            "lstm": 0.30,
                        },
                    }
                ],
                "summary": {
                    "total_samples": 1,
                    "anomalies_detected": 0,
                    "normal_count": 1,
                    "warning_count": 0,
                    "critical_count": 0,
                    "avg_ensemble_score": 0.25,
                },
            }
        }


# -------------------------------------------------------------------------
# Health check schemas
# -------------------------------------------------------------------------
class ModelMetrics(BaseModel):
    """Metrics for a single model."""
    name: str = Field(..., description="Model name")
    loaded: bool = Field(..., description="Whether model is loaded")
    threshold: Optional[float] = Field(None, description="Detection threshold")


class HealthResponse(BaseModel):
    """Response schema for health check."""
    status: Literal["healthy", "degraded", "unhealthy"] = Field(
        ..., description="Overall system health status"
    )
    models: List[ModelMetrics] = Field(..., description="Status of each model")
    ensemble_config: dict = Field(..., description="Ensemble configuration")

    class Config:
        json_schema_extra = {
            "example": {
                "status": "healthy",
                "models": [
                    {"name": "autoencoder", "loaded": True, "threshold": 0.05},
                    {"name": "isolation_forest", "loaded": True, "threshold": None},
                    {"name": "lstm", "loaded": True, "threshold": 0.5},
                ],
                "ensemble_config": {
                    "weights": {
                        "autoencoder": 0.4,
                        "isolation_forest": 0.3,
                        "lstm": 0.3,
                    }
                },
            }
        }


# -------------------------------------------------------------------------
# Error schemas
# -------------------------------------------------------------------------
class ErrorResponse(BaseModel):
    """Standard error response."""
    detail: str = Field(..., description="Error message")
    error_type: str = Field(..., description="Error type/category")

    class Config:
        json_schema_extra = {
            "example": {
                "detail": "Invalid input shape: expected (n, 30), got (n, 25)",
                "error_type": "ValidationError",
            }
        }
