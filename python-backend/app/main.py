"""Enhanced FastAPI application with proper structure and error handling."""

import time
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Dict, Any

from fastapi import FastAPI, Request, HTTPException, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Import configuration and logging
from config import settings
from core.logging import get_logger, setup_logging

# Import exception classes
from core.exceptions import (
    FTDPException,
    DatasetException,
    ModelException,
    JobException,
    ValidationException,
    FileProcessingException,
    TrainingDataException,
)

# Import API routers
from api.v1.health import router as health_router
from api.v1.datasets import router as datasets_router
from api.v1.models import router as models_router
from api.v1.jobs import router as jobs_router
from api.v1.training import router as training_router
from api.v1.metadata import router as metadata_router
from api.v1.csv import router as csv_router

# Initialize logging
logger = get_logger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    
    # Load training data
    try:
        from services.training_service import training_service
        training_service.load_training_csv_data()
        logger.info("Training monitor data loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load training data: {e}")
    
    logger.info("Application startup completed")
    yield
    
    # Shutdown
    logger.info("Application shutdown initiated")


# FastAPI app initialization
app = FastAPI(
    title=settings.app_name,
    description="Enhanced FastAPI backend for Fine-Tuning Dashboard Platform with proper error handling and structured logging",
    version=settings.app_version,
    debug=settings.debug,
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handlers
@app.exception_handler(ValidationException)
async def validation_exception_handler(request: Request, exc: ValidationException):
    """Handle validation exceptions."""
    logger.warning(f"Validation error on {request.method} {request.url}: {exc.message}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": "Validation Error",
            "detail": exc.message,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url)
        }
    )


@app.exception_handler(DatasetException)
async def dataset_exception_handler(request: Request, exc: DatasetException):
    """Handle dataset exceptions."""
    logger.error(f"Dataset error on {request.method} {request.url}: {exc.message}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Dataset Error",
            "detail": exc.message,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url)
        }
    )


@app.exception_handler(ModelException)
async def model_exception_handler(request: Request, exc: ModelException):
    """Handle model exceptions."""
    logger.error(f"Model error on {request.method} {request.url}: {exc.message}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Model Error",
            "detail": exc.message,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url)
        }
    )


@app.exception_handler(JobException)
async def job_exception_handler(request: Request, exc: JobException):
    """Handle job exceptions."""
    logger.error(f"Job error on {request.method} {request.url}: {exc.message}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Job Error",
            "detail": exc.message,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url)
        }
    )


@app.exception_handler(FileProcessingException)
async def file_processing_exception_handler(request: Request, exc: FileProcessingException):
    """Handle file processing exceptions."""
    logger.error(f"File processing error on {request.method} {request.url}: {exc.message}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": "File Processing Error",
            "detail": exc.message,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url)
        }
    )


@app.exception_handler(TrainingDataException)
async def training_data_exception_handler(request: Request, exc: TrainingDataException):
    """Handle training data exceptions."""
    logger.warning(f"Training data error on {request.method} {request.url}: {exc.message}")
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "error": "Training Data Unavailable",
            "detail": exc.message,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url)
        }
    )


@app.exception_handler(FTDPException)
async def ftdp_exception_handler(request: Request, exc: FTDPException):
    """Handle generic FTDP exceptions."""
    logger.error(f"FTDP error on {request.method} {request.url}: {exc.message}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Error",
            "detail": exc.message,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url)
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors."""
    logger.warning(f"Request validation error on {request.method} {request.url}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Request Validation Error",
            "detail": "Invalid request data",
            "validation_errors": exc.errors(),
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url)
        }
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with enhanced logging."""
    if exc.status_code >= 500:
        logger.error(f"HTTP {exc.status_code} error on {request.method} {request.url}: {exc.detail}")
    else:
        logger.warning(f"HTTP {exc.status_code} error on {request.method} {request.url}: {exc.detail}")
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": f"HTTP {exc.status_code}",
            "detail": exc.detail,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url)
        }
    )


@app.exception_handler(500)
async def internal_server_error_handler(request: Request, exc: Exception):
    """Handle unexpected internal server errors."""
    logger.error(f"Unexpected error on {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "detail": "An unexpected error occurred",
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url)
        }
    )


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests with timing information."""
    start_time = time.time()
    
    # Log incoming request
    logger.info(
        f"📨 {request.method} {request.url}",
        extra={
            "method": request.method,
            "endpoint": str(request.url),
            "client_ip": request.client.host if request.client else None
        }
    )
    
    # Process request
    response = await call_next(request)
    
    # Calculate duration
    duration = (time.time() - start_time) * 1000  # Convert to milliseconds
    
    # Log response
    log_level = "info" if response.status_code < 400 else "warning" if response.status_code < 500 else "error"
    log_message = f"📤 {response.status_code} | {duration:.2f}ms"
    
    getattr(logger, log_level)(
        log_message,
        extra={
            "method": request.method,
            "endpoint": str(request.url),
            "status_code": response.status_code,
            "duration": round(duration, 2)
        }
    )
    
    return response


# Include routers
app.include_router(health_router, tags=["Health"])
app.include_router(datasets_router, tags=["Datasets"])
app.include_router(models_router, tags=["Models"])
app.include_router(jobs_router, tags=["Jobs"])
app.include_router(training_router, tags=["Training"])
app.include_router(metadata_router, tags=["Metadata"])
app.include_router(csv_router, tags=["CSV Processing"])


if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"Starting {settings.app_name} server...")
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.reload,
        log_level=settings.log_level.lower()
    )
