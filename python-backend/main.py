
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import json
from typing import Dict, List, Any
import io
import logging

# Import service classes
from services.dataset_selection import DatasetSelection
from services.model_selection import ModelSelection


# All endpoint definitions must come after app and CORS setup

# ------------------------
# DATASET ENDPOINTS
# ------------------------

def register_endpoints(app):
    @app.get("/api/datasets")
    async def get_datasets():
        return DatasetSelection.load_datasets()

    @app.get("/api/datasets/{uid}")
    async def get_dataset(uid: str):
        ds = DatasetSelection.get_dataset_by_uid(uid)
        if not ds:
            raise HTTPException(status_code=404, detail="Dataset not found")
        return ds

    @app.post("/api/datasets")
    async def add_dataset(dataset: Dict[str, Any]):
        ok = DatasetSelection.add_dataset(dataset)
        if not ok:
            raise HTTPException(status_code=500, detail="Failed to add dataset")
        return {"success": True}

    @app.put("/api/datasets/{uid}")
    async def update_dataset(uid: str, updates: Dict[str, Any]):
        ok = DatasetSelection.update_dataset(uid, updates)
        if not ok:
            raise HTTPException(status_code=404, detail="Dataset not found or update failed")
        return {"success": True}

    @app.delete("/api/datasets/{uid}")
    async def delete_dataset(uid: str):
        ok = DatasetSelection.delete_dataset(uid)
        if not ok:
            raise HTTPException(status_code=404, detail="Dataset not found or delete failed")
        return {"success": True}

    # ------------------------
    # MODEL ENDPOINTS
    # ------------------------

    @app.get("/api/models")
    async def get_models():
        return ModelSelection.load_models()

    @app.get("/api/models/search")
    async def search_models(query: str = Query(..., min_length=2), limit: int = 10):
        try:
            results = ModelSelection.search_huggingface_models(query, limit)
            return results
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"HuggingFace search failed: {str(e)}")

    @app.post("/api/models")
    async def add_model(model: Dict[str, Any]):
        try:
            result = ModelSelection.add_model(model)
            if result["success"]:
                return result
            else:
                if result.get("error") == "duplicate":
                    raise HTTPException(status_code=409, detail=result["message"])
                else:
                    raise HTTPException(status_code=500, detail=result["message"])
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to add model: {str(e)}")

    @app.delete("/api/models/{model_id:path}")
    async def remove_model(model_id: str):
        try:
            result = ModelSelection.remove_model(model_id)
            if result["success"]:
                return result
            else:
                raise HTTPException(status_code=404, detail=result["message"])
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to remove model: {str(e)}")

    @app.get("/api/models/check/{model_id:path}")
    async def check_model_exists(model_id: str):
        try:
            exists = ModelSelection.model_exists(model_id)
            return {"exists": exists, "model_id": model_id}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to check model: {str(e)}")


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app initialization
app = FastAPI(
    title="CSV Preview API",
    description="FastAPI backend for parsing and previewing CSV files",
    version="1.0.0"
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001", "http://localhost:3002", "http://127.0.0.1:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add request logging middleware
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"📨 Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"📤 Response status: {response.status_code}")
    return response

# Register endpoints after app and CORS setup
register_endpoints(app)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "CSV Preview API is running", "status": "healthy"}


@app.post("/api/preview-csv")
async def preview_csv(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Parse and preview a CSV file, returning columns and first 5 rows
    
    Args:
        file: Uploaded CSV file
        
    Returns:
        Dict containing filename, columns, data, and validation info
    """
    try:
        # Validate file type
        if not file.filename or not file.filename.lower().endswith('.csv'):
            raise HTTPException(
                status_code=400, 
                detail="Only CSV files are supported"
            )
        
        # Read the file content
        content = await file.read()
        
        # Handle different encodings
        try:
            # Try UTF-8 first
            content_str = content.decode('utf-8')
        except UnicodeDecodeError:
            try:
                # Try UTF-8 with BOM
                content_str = content.decode('utf-8-sig')
            except UnicodeDecodeError:
                # Fall back to latin-1
                content_str = content.decode('latin-1')
                logger.warning(f"File {file.filename} decoded with latin-1 encoding")
        
        # Parse CSV with pandas
        try:
            # Use StringIO to convert string to file-like object
            csv_buffer = io.StringIO(content_str)
            
            # Try different parsing strategies for maximum compatibility
            df = None
            parsing_errors = []
            
            # Strategy 1: Try with python engine (most flexible)
            try:
                csv_buffer.seek(0)  # Reset buffer position
                df = pd.read_csv(
                    csv_buffer,
                    sep=None,  # Auto-detect separator
                    engine='python',  # More flexible parsing
                    on_bad_lines='skip'  # Skip problematic lines
                )
            except Exception as e:
                parsing_errors.append(f"Python engine: {str(e)}")
            
            # Strategy 2: Try with C engine if python engine failed
            if df is None:
                try:
                    csv_buffer.seek(0)  # Reset buffer position
                    df = pd.read_csv(
                        csv_buffer,
                        engine='c',  # Faster C engine
                        low_memory=False,
                        on_bad_lines='skip'
                    )
                except Exception as e:
                    parsing_errors.append(f"C engine: {str(e)}")
            
            # Strategy 3: Try with basic pandas defaults
            if df is None:
                try:
                    csv_buffer.seek(0)  # Reset buffer position
                    df = pd.read_csv(csv_buffer)
                except Exception as e:
                    parsing_errors.append(f"Default: {str(e)}")
            
            # If all strategies failed, raise the most informative error
            if df is None:
                error_msg = "Failed to parse CSV with all strategies: " + "; ".join(parsing_errors)
                raise Exception(error_msg)
            
        except Exception as csv_error:
            logger.error(f"CSV parsing error for {file.filename}: {str(csv_error)}")
            raise HTTPException(
                status_code=400,
                detail=f"Failed to parse CSV file: {str(csv_error)}"
            )
        
        # Check if DataFrame is empty
        if df.empty:
            raise HTTPException(
                status_code=400,
                detail="CSV file appears to be empty or has no valid data"
            )
        
        # Get column names (strip whitespace)
        columns = [col.strip() for col in df.columns.tolist()]
        
        # Validate required columns
        validation_errors = []
        has_input = 'input' in columns
        has_output = 'output' in columns
        
        if not has_input:
            validation_errors.append('Missing required "input" column')
        if not has_output:
            validation_errors.append('Missing required "output" column')
        
        # Get first 5 rows of data
        preview_rows = min(5, len(df))
        preview_data = []
        
        for i in range(preview_rows):
            row = {}
            for col in columns:
                value = df.iloc[i][col]
                # Handle NaN values
                if pd.isna(value):
                    row[col] = None
                else:
                    # Convert to string for JSON serialization
                    row[col] = str(value)
            preview_data.append(row)
        
        # Calculate file statistics
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
        # Re-raise HTTP exceptions
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
