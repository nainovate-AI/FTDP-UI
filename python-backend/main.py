

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import logging
from typing import Dict, Any

from app.api.v1.datasets import router as datasets_router
from app.api.v1.models import router as models_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.training import router as training_router
from app.api.v1.metadata import router as metadata_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CSV Preview API",
    description="FastAPI backend for parsing and previewing CSV files",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001", "http://localhost:3002", "http://127.0.0.1:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(datasets_router)
app.include_router(models_router)
app.include_router(jobs_router)
app.include_router(training_router)
app.include_router(metadata_router)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "CSV Preview API is running", "status": "healthy"}

@app.post("/api/preview-csv")
async def preview_csv(file: UploadFile = File(...)) -> Dict[str, Any]:
    try:
        if not file.filename or not file.filename.lower().endswith('.csv'):
            raise HTTPException(
                status_code=400, 
                detail="Only CSV files are supported"
            )
        content = await file.read()
        try:
            content_str = content.decode('utf-8')
        except UnicodeDecodeError:
            try:
                content_str = content.decode('utf-8-sig')
            except UnicodeDecodeError:
                content_str = content.decode('latin-1')
                logger.warning(f"File {file.filename} decoded with latin-1 encoding")
        try:
            csv_buffer = io.StringIO(content_str)
            df = None
            parsing_errors = []
            try:
                csv_buffer.seek(0)
                df = pd.read_csv(
                    csv_buffer,
                    sep=None,
                    engine='python',
                    on_bad_lines='skip'
                )
            except Exception as e:
                parsing_errors.append(f"Python engine: {str(e)}")
            if df is None:
                try:
                    csv_buffer.seek(0)
                    df = pd.read_csv(
                        csv_buffer,
                        engine='c',
                        low_memory=False,
                        on_bad_lines='skip'
                    )
                except Exception as e:
                    parsing_errors.append(f"C engine: {str(e)}")
            if df is None:
                try:
                    csv_buffer.seek(0)
                    df = pd.read_csv(csv_buffer)
                except Exception as e:
                    parsing_errors.append(f"Default: {str(e)}")
            if df is None:
                error_msg = "Failed to parse CSV with all strategies: " + "; ".join(parsing_errors)
                raise Exception(error_msg)
        except Exception as csv_error:
            logger.error(f"CSV parsing error for {file.filename}: {str(csv_error)}")
            raise HTTPException(
                status_code=400,
                detail=f"Failed to parse CSV file: {str(csv_error)}"
            )
        if df.empty:
            raise HTTPException(
                status_code=400,
                detail="CSV file appears to be empty or has no valid data"
            )
        columns = [col.strip() for col in df.columns.tolist()]
        validation_errors = []
        has_input = 'input' in columns
        has_output = 'output' in columns
        if not has_input:
            validation_errors.append('Missing required "input" column')
        if not has_output:
            validation_errors.append('Missing required "output" column')
        preview_rows = min(5, len(df))
        preview_data = []
        for i in range(preview_rows):
            row = {}
            for col in columns:
                value = df.iloc[i][col]
                if pd.isna(value):
                    row[col] = None
                else:
                    row[col] = str(value)
            preview_data.append(row)
        total_rows = len(df)
        file_size_kb = len(content) / 1024
        response_data = {
            "filename": file.filename,
            "columns": columns,
            "data": preview_data,
            "validation_errors": validation_errors,
            "statistics": {
                "total_rows": total_rows,
                "total_columns": len(columns),
                "file_size_kb": round(file_size_kb, 2),
                "preview_rows": preview_rows,
                "has_required_columns": has_input and has_output
            },
            "isNewUpload": True
        }
        logger.info(f"Successfully parsed CSV: {file.filename} ({total_rows} rows, {len(columns)} columns)")
        return response_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error processing file {file.filename}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred while processing the file: {str(e)}"
        )


@app.get("/api/health")
async def health_check():
    """Detailed health check with system info"""
    try:
        # Test pandas import
        import pandas as pd
        pandas_version = pd.__version__
        
        return {
            "status": "healthy",
            "service": "CSV Preview API",
            "version": "1.0.0",
            "dependencies": {
                "pandas": pandas_version,
                "fastapi": "0.104.1"
            },
            "endpoints": {
                "preview": "/api/preview-csv",
                "health": "/api/health"
            }
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )
