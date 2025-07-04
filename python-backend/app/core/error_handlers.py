from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from .exceptions import DatasetNotFound, ModelNotFound

async def dataset_not_found_handler(request: Request, exc: DatasetNotFound):
    return JSONResponse(
        status_code=404,
        content={"error": "Dataset not found", "detail": str(exc)}
    )

async def model_not_found_handler(request: Request, exc: ModelNotFound):
    return JSONResponse(
        status_code=404,
        content={"error": "Model not found", "detail": str(exc)}
    )
