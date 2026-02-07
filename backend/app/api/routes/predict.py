"""
Prediction endpoint for real-time anomaly detection.
"""

import numpy as np
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse

from app.api.schemas import (
    PredictionRequest,
    PredictionResponse,
    ErrorResponse,
)
from app.services.inference_service import InferenceService

router = APIRouter()

# Get singleton inference service
inference_service = InferenceService()


@router.post(
    "/predict",
    response_model=PredictionResponse,
    responses={
        503: {"model": ErrorResponse, "description": "Service unavailable"},
        400: {"model": ErrorResponse, "description": "Bad request"},
    },
    summary="Predict anomalies in machinery data",
    description=(
        "Accepts feature vectors and returns anomaly predictions using "
        "the ensemble of trained models (Autoencoder, Isolation Forest, LSTM)."
    ),
)
async def predict(request: PredictionRequest):
    """Make anomaly predictions on input features.

    Args:
        request: PredictionRequest containing feature array.

    Returns:
        PredictionResponse with predictions and summary statistics.

    Raises:
        HTTPException: If service is not ready or input is invalid.
    """
    # Check if service is ready
    if not inference_service.is_ready():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Models not loaded. Service is not ready.",
        )

    try:
        # Convert features to numpy array
        features = np.array(request.features, dtype=np.float32)

        # Validate feature shape
        if features.ndim != 2:
            raise ValueError(
                f"Features must be 2D array, got shape {features.shape}"
            )

        # Make predictions
        result = inference_service.predict(features)

        return PredictionResponse(**result)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}",
        )
