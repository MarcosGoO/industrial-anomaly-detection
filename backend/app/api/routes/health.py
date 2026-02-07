"""
Health check endpoint for monitoring model status.
"""

from fastapi import APIRouter

from app.api.schemas import HealthResponse
from app.services.inference_service import InferenceService

router = APIRouter()

# Get singleton inference service
inference_service = InferenceService()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Check system health",
    description=(
        "Returns health status of the anomaly detection system, "
        "including model availability and configuration."
    ),
)
async def health():
    """Get health status of the system and loaded models.

    Returns:
        HealthResponse with system status and model information.
    """
    health_status = inference_service.get_health_status()
    return HealthResponse(**health_status)


@router.get(
    "/ready",
    summary="Check if service is ready",
    description="Simple readiness check for Kubernetes/Docker health probes.",
)
async def ready():
    """Check if service is ready to handle requests.

    Returns:
        JSON response with ready status.
    """
    is_ready = inference_service.is_ready()
    return {
        "ready": is_ready,
        "message": "Service is ready" if is_ready else "Service is not ready",
    }
