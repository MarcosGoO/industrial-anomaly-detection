"""
FastAPI main application for Industrial Anomaly Detection System.

This module sets up the FastAPI application with CORS middleware,
health checks, and API routes for real-time anomaly detection.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import predict, health

# Initialize FastAPI app
app = FastAPI(
    title="Industrial Anomaly Detection API",
    description="Real-time anomaly detection for rotating machinery using ensemble ML models",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(predict.router, prefix="/api", tags=["prediction"])
app.include_router(health.router, prefix="/api", tags=["health"])


@app.get("/")
async def root():
    """Root endpoint returning API information."""
    return {
        "name": "Industrial Anomaly Detection API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
