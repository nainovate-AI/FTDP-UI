
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import json
from typing import Dict, List, Any, Optional
import io
import logging
import os
import asyncio
from datetime import datetime, timedelta
from pydantic import BaseModel

# Import service classes
from services.dataset_selection import DatasetSelection
from services.model_selection import ModelSelection
from services.job_configuration import JobConfiguration

# Training Monitor Data Models
class TrainingLoss(BaseModel):
    timestamp: int
    epoch: int
    step: int
    train_loss: float
    validation_loss: float
    learning_rate: float
    batch_size: int

class ResourceMetrics(BaseModel):
    timestamp: int
    cpu_percent: float
    ram_used_gb: float
    ram_total_gb: float
    gpu_percent: float
    vram_used_gb: float
    vram_total_gb: float
    disk_used_gb: float
    disk_total_gb: float
    gpu_temp: int
    cpu_temp: int
    network_in_mbps: float
    network_out_mbps: float

class TrainingStatus(BaseModel):
    job_id: str
    status: str
    current_epoch: int
    total_epochs: int
    progress_percent: float
    elapsed_time: str
    estimated_remaining: str
    current_step: int
    total_steps: int

# Global training monitor data
training_data: List[TrainingLoss] = []
resource_data: List[ResourceMetrics] = []
training_start_time = datetime.now()
current_training_index = 0

def load_training_csv_data():
    """Load training data from CSV files"""
    global training_data, resource_data
    
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Load training losses
        losses_path = os.path.join(script_dir, "training_losses.csv")
        if os.path.exists(losses_path):
            df_losses = pd.read_csv(losses_path)
            training_data = [TrainingLoss(**row) for _, row in df_losses.iterrows()]
            logging.info(f"Loaded {len(training_data)} training loss records")
        
        # Load resource metrics
        resources_path = os.path.join(script_dir, "resource_metrics.csv")
        if os.path.exists(resources_path):
            df_resources = pd.read_csv(resources_path)
            resource_data = [ResourceMetrics(**row) for _, row in df_resources.iterrows()]
            logging.info(f"Loaded {len(resource_data)} resource metric records")
            
    except Exception as e:
        logging.error(f"Error loading training CSV data: {e}")

def get_current_training_index():
    """Get current training data index based on elapsed time"""
    global current_training_index, training_start_time
    
    if not training_data:
        return 0
    
    # Calculate elapsed seconds since start (continuous time)
    elapsed_seconds = (datetime.now() - training_start_time).total_seconds()
    
    # Each row represents 3 seconds, calculate index
    current_training_index = int(elapsed_seconds / 3) % len(training_data)
    
    return current_training_index


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

    # ------------------------
    # JOB CONFIGURATION ENDPOINTS
    # ------------------------

    @app.get("/api/metadata")
    async def get_metadata():
        """Get metadata.json content"""
        try:
            return JobConfiguration.get_metadata()
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail="Metadata file not found")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to load metadata: {str(e)}")

    @app.post("/api/metadata")
    async def update_metadata(updates: Dict[str, Any]):
        """Update metadata.json with new data"""
        try:
            success = JobConfiguration.update_metadata(updates)
            if success:
                return {"success": True, "message": "Metadata updated successfully"}
            else:
                raise HTTPException(status_code=500, detail="Failed to update metadata")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to update metadata: {str(e)}")

    @app.get("/api/hyperparameter-config")
    async def get_hyperparameter_config():
        """Get hyperparameter-config.json content"""
        try:
            return JobConfiguration.get_hyperparameter_config()
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail="Hyperparameter config file not found")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to load hyperparameter config: {str(e)}")

    @app.post("/api/hyperparameter-config")
    async def update_hyperparameter_config(config_data: Dict[str, Any]):
        """Update hyperparameter-config.json"""
        try:
            success = JobConfiguration.update_hyperparameter_config(config_data)
            if success:
                return {"success": True, "message": "Hyperparameter config updated successfully"}
            else:
                raise HTTPException(status_code=500, detail="Failed to update hyperparameter config")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to update hyperparameter config: {str(e)}")

    @app.get("/api/hyperparameter-config/{uid}")
    async def get_hyperparameter_by_uid(uid: str):
        """Get specific hyperparameter configuration by UID"""
        try:
            config = JobConfiguration.get_hyperparameter_by_uid(uid)
            if config:
                return config
            else:
                raise HTTPException(status_code=404, detail=f"Hyperparameter UID not found: {uid}")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get hyperparameter config: {str(e)}")

    @app.get("/api/job-configuration")
    async def get_job_configuration():
        """Get complete job configuration assembled from metadata and related files"""
        try:
            return JobConfiguration.get_job_configuration()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get job configuration: {str(e)}")

    @app.get("/api/job-configuration/validate")
    async def validate_job_configuration():
        """Validate job configuration - check that all UIDs exist in their respective files"""
        try:
            return JobConfiguration.validate_job_configuration()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to validate job configuration: {str(e)}")

    @app.get("/api/dataset-by-uid/{uid}")
    async def get_dataset_by_uid(uid: str):
        """Get dataset information by UID"""
        try:
            dataset = JobConfiguration.get_dataset_by_uid(uid)
            if dataset:
                return dataset
            else:
                raise HTTPException(status_code=404, detail=f"Dataset UID not found: {uid}")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get dataset: {str(e)}")

    @app.get("/api/model-by-uid/{uid}")
    async def get_model_by_uid(uid: str):
        """Get model information by UID"""
        try:
            model = JobConfiguration.get_model_by_uid(uid)
            if model:
                return model
            else:
                raise HTTPException(status_code=404, detail=f"Model UID not found: {uid}")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get model: {str(e)}")

    # ------------------------
    # FINETUNING JOBS ENDPOINTS
    # ------------------------

    @app.post("/api/jobs")
    async def create_finetuning_job(job_data: Dict[str, Any]):
        """Create a new finetuning job"""
        try:
            result = JobConfiguration.create_finetuning_job(job_data)
            if result["success"]:
                return result
            else:
                raise HTTPException(status_code=500, detail=result["message"])
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to create job: {str(e)}")

    @app.get("/api/jobs")
    async def get_all_jobs():
        """Get all finetuning jobs (current + past)"""
        try:
            current_jobs = JobConfiguration.load_json_file("current-jobs.json")
            past_jobs = JobConfiguration.load_json_file("past-jobs.json")
            
            all_jobs = current_jobs.get("jobs", []) + past_jobs.get("jobs", [])
            
            return {
                "jobs": all_jobs,
                "total": len(all_jobs),
                "current_count": len(current_jobs.get("jobs", [])),
                "past_count": len(past_jobs.get("jobs", [])),
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get jobs: {str(e)}")

    @app.get("/api/jobs/current")
    async def get_current_jobs():
        """Get current active jobs"""
        try:
            return JobConfiguration.load_json_file("current-jobs.json")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get current jobs: {str(e)}")

    @app.get("/api/jobs/past")
    async def get_past_jobs():
        """Get past completed/failed jobs"""
        try:
            return JobConfiguration.load_json_file("past-jobs.json")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get past jobs: {str(e)}")

    @app.get("/api/jobs/statistics")
    async def get_job_statistics():
        """Get job statistics across all jobs"""
        try:
            current_jobs = JobConfiguration.load_json_file("current-jobs.json")
            past_jobs = JobConfiguration.load_json_file("past-jobs.json")
            
            current_list = current_jobs.get("jobs", [])
            past_list = past_jobs.get("jobs", [])
            
            stats = {
                "total": len(current_list) + len(past_list),
                "current": {
                    "total": len(current_list),
                    "running": len([j for j in current_list if j.get("status") == "running"]),
                    "queued": len([j for j in current_list if j.get("status") == "queued"]),
                    "created": len([j for j in current_list if j.get("status") == "created"])
                },
                "past": {
                    "total": len(past_list),
                    "completed": len([j for j in past_list if j.get("status") == "completed"]),
                    "failed": len([j for j in past_list if j.get("status") == "failed"])
                },
                "success_rate": f"{(len([j for j in past_list if j.get('status') == 'completed']) / len(past_list) * 100):.1f}%" if past_list else "0%",
                "last_updated": datetime.now().isoformat()
            }
            
            return stats
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get job statistics: {str(e)}")

    @app.get("/api/jobs/{uid}")
    async def get_job_by_uid(uid: str):
        """Get a specific job by UID from current or past jobs"""
        try:
            # Search in current jobs first
            current_jobs = JobConfiguration.load_json_file("current-jobs.json")
            for job in current_jobs.get("jobs", []):
                if job.get("uid") == uid:
                    # If job is running, try to enhance with live data
                    if job.get("status") == "running":
                        try:
                            current_idx = get_current_training_index()
                            if training_data and current_idx < len(training_data):
                                job["live_metrics"] = {
                                    "current_loss": training_data[current_idx].train_loss,
                                    "validation_loss": training_data[current_idx].validation_loss,
                                    "current_epoch": training_data[current_idx].epoch,
                                    "current_step": training_data[current_idx].step,
                                    "last_updated": datetime.now().isoformat()
                                }
                        except Exception as e:
                            logging.warning(f"Could not add live metrics to job {uid}: {e}")
                    return job
            
            # Search in past jobs
            past_jobs = JobConfiguration.load_json_file("past-jobs.json")
            for job in past_jobs.get("jobs", []):
                if job.get("uid") == uid:
                    return job
            
            raise HTTPException(status_code=404, detail=f"Job UID not found: {uid}")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get job: {str(e)}")

    # ------------------------
    # TRAINING MONITOR ENDPOINTS
    # ------------------------

    @app.get("/api/training/losses", response_model=List[TrainingLoss])
    async def get_training_losses(last_n: Optional[int] = 20):
        """Get recent training losses (last 15-20 seconds)"""
        if not training_data:
            raise HTTPException(status_code=503, detail="Training data not available")
        
        current_idx = get_current_training_index()
        
        # Return last N points up to current index (15-20 seconds = ~5-7 data points)
        start_idx = max(0, current_idx - last_n + 1)
        end_idx = current_idx + 1
        
        return training_data[start_idx:end_idx]

    @app.get("/api/training/losses/current", response_model=TrainingLoss)
    async def get_current_training_loss():
        """Get the current training loss data point"""
        if not training_data:
            raise HTTPException(status_code=503, detail="Training data not available")
        
        current_idx = get_current_training_index()
        return training_data[current_idx]

    @app.get("/api/training/resources", response_model=List[ResourceMetrics])
    async def get_resource_metrics(last_n: Optional[int] = 20):
        """Get recent resource metrics (last 15-20 seconds)"""
        if not resource_data:
            raise HTTPException(status_code=503, detail="Resource data not available")
        
        current_idx = get_current_training_index()
        
        # Return last N points up to current index
        start_idx = max(0, current_idx - last_n + 1)
        end_idx = current_idx + 1
        
        return resource_data[start_idx:end_idx]

    @app.get("/api/training/resources/current", response_model=ResourceMetrics)
    async def get_current_resource_metrics():
        """Get the current resource metrics data point"""
        if not resource_data:
            raise HTTPException(status_code=503, detail="Resource data not available")
        
        current_idx = get_current_training_index()
        return resource_data[current_idx]

    @app.get("/api/training/status/{job_id}", response_model=TrainingStatus)
    async def get_training_status(job_id: str):
        """Get current training status for a job"""
        if not training_data:
            raise HTTPException(status_code=503, detail="Training data not available")
        
        current_idx = get_current_training_index()
        current_data = training_data[current_idx]
        
        # Calculate progress
        total_data_points = len(training_data)
        progress_percent = (current_idx / total_data_points) * 100
        
        # Calculate timing with continuous time
        elapsed_time = datetime.now() - training_start_time
        if progress_percent > 0:
            total_estimated = elapsed_time / (progress_percent / 100)
            remaining_time = total_estimated - elapsed_time
        else:
            remaining_time = timedelta(seconds=0)
        
        # Format times
        def format_timedelta(td):
            total_seconds = int(td.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            seconds = total_seconds % 60
            if hours > 0:
                return f"{hours}h {minutes}m {seconds}s"
            elif minutes > 0:
                return f"{minutes}m {seconds}s"
            else:
                return f"{seconds}s"
        
        return TrainingStatus(
            job_id=job_id,
            status="running" if current_idx < total_data_points - 1 else "completed",
            current_epoch=current_data.epoch,
            total_epochs=3,  # Based on our data
            progress_percent=round(progress_percent, 1),
            elapsed_time=format_timedelta(elapsed_time),
            estimated_remaining=f"~{format_timedelta(remaining_time)}",
            current_step=current_data.step,
            total_steps=101  # Based on our data
        )

    @app.get("/api/training/summary")
    async def get_training_summary():
        """Get overall training summary"""
        if not training_data or not resource_data:
            raise HTTPException(status_code=503, detail="Training data not available")
        
        current_idx = get_current_training_index()
        current_loss = training_data[current_idx]
        current_resources = resource_data[current_idx]
        
        elapsed_time = datetime.now() - training_start_time
        
        return {
            "current_epoch": current_loss.epoch,
            "current_step": current_loss.step,
            "current_train_loss": current_loss.train_loss,
            "current_val_loss": current_loss.validation_loss,
            "gpu_utilization": current_resources.gpu_percent,
            "memory_usage": {
                "ram_used": current_resources.ram_used_gb,
                "ram_total": current_resources.ram_total_gb,
                "vram_used": current_resources.vram_used_gb,
                "vram_total": current_resources.vram_total_gb
            },
            "temperatures": {
                "gpu": current_resources.gpu_temp,
                "cpu": current_resources.cpu_temp
            },
            "elapsed_time": str(elapsed_time).split('.')[0],
            "data_point": f"{current_idx + 1}/{len(training_data)}"
        }


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

@app.on_event("startup")
async def startup_event():
    """Load CSV data on startup"""
    load_training_csv_data()
    logging.info("Training monitor data loaded successfully")

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
