"""
FastAPI backend for serving mock training data
Provides real-time mock data for training losses and resource metrics
Supports both manual and automated training modes with iteration-based progression
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import asyncio
import os
from datetime import datetime, timedelta
import uvicorn

app = FastAPI(title="Mock Training API", version="1.0.0")

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class TrainingLoss(BaseModel):
    iteration: int
    epoch: int
    step: int
    train_loss: float
    validation_loss: float
    learning_rate: float
    batch_size: int

class ResourceMetrics(BaseModel):
    iteration: int
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

# Global data storage
training_data_manual: List[TrainingLoss] = []
training_data_automated: List[TrainingLoss] = []
resource_data_manual: List[ResourceMetrics] = []
resource_data_automated: List[ResourceMetrics] = []
current_iteration = 0
start_time = datetime.now()
training_mode = "manual"  # "manual" or "automated"
is_completed = False

def load_csv_data():
    """Load data from CSV files for both manual and automated modes"""
    global training_data_manual, training_data_automated, resource_data_manual, resource_data_automated
    
    try:
        # Get the directory where this script is located
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Load manual training metrics
        manual_training_path = os.path.join(script_dir, "data", "training_metrics_manual.csv")
        if os.path.exists(manual_training_path):
            df_manual_training = pd.read_csv(manual_training_path)
            training_data_manual = [TrainingLoss(**row) for _, row in df_manual_training.iterrows()]
            print(f"Loaded {len(training_data_manual)} manual training records")
        else:
            print(f"Manual training metrics CSV not found at: {manual_training_path}")
        
        # Load automated training metrics
        automated_training_path = os.path.join(script_dir, "data", "training_metrics_automated.csv")
        if os.path.exists(automated_training_path):
            df_automated_training = pd.read_csv(automated_training_path)
            training_data_automated = [TrainingLoss(**row) for _, row in df_automated_training.iterrows()]
            print(f"Loaded {len(training_data_automated)} automated training records")
        else:
            print(f"Automated training metrics CSV not found at: {automated_training_path}")
        
        # Load manual resource metrics
        manual_resources_path = os.path.join(script_dir, "data", "resource_metrics_manual.csv")
        if os.path.exists(manual_resources_path):
            df_manual_resources = pd.read_csv(manual_resources_path)
            resource_data_manual = [ResourceMetrics(**row) for _, row in df_manual_resources.iterrows()]
            print(f"Loaded {len(resource_data_manual)} manual resource metric records")
        else:
            print(f"Manual resource metrics CSV not found at: {manual_resources_path}")
        
        # Load automated resource metrics
        automated_resources_path = os.path.join(script_dir, "data", "resource_metrics_automated.csv")
        if os.path.exists(automated_resources_path):
            df_automated_resources = pd.read_csv(automated_resources_path)
            resource_data_automated = [ResourceMetrics(**row) for _, row in df_automated_resources.iterrows()]
            print(f"Loaded {len(resource_data_automated)} automated resource metric records")
        else:
            print(f"Automated resource metrics CSV not found at: {automated_resources_path}")
            
    except Exception as e:
        print(f"Error loading CSV data: {e}")

def get_current_data_point():
    """Get current data point based on elapsed time and training mode"""
    global current_iteration, start_time, is_completed
    
    # Get appropriate dataset based on training mode
    training_data = training_data_manual if training_mode == "manual" else training_data_automated
    
    if not training_data:
        return 0
    
    # Calculate elapsed seconds since start
    elapsed_seconds = (datetime.now() - start_time).total_seconds()
    
    # Each iteration represents 3 seconds
    target_iteration = int(elapsed_seconds / 3)
    
    # Handle completion and looping
    if target_iteration >= len(training_data):
        is_completed = True
        # Loop through the data continuously
        current_iteration = target_iteration % len(training_data)
    else:
        current_iteration = target_iteration
        is_completed = False
    
    return current_iteration

@app.on_event("startup")
async def startup_event():
    """Load data when the server starts"""
    load_csv_data()
    print("Mock Training API started successfully!")

@app.get("/")
async def root():
    """Health check endpoint"""
    training_data = training_data_manual if training_mode == "manual" else training_data_automated
    return {
        "message": "Mock Training API",
        "status": "running",
        "training_mode": training_mode,
        "data_points": len(training_data),
        "is_completed": is_completed,
        "current_iteration": current_iteration,
        "uptime_seconds": (datetime.now() - start_time).total_seconds()
    }

@app.get("/api/training/losses", response_model=List[TrainingLoss])
async def get_training_losses(last_n: Optional[int] = 50):
    """Get recent training losses"""
    training_data = training_data_manual if training_mode == "manual" else training_data_automated
    if not training_data:
        raise HTTPException(status_code=503, detail="Training data not available")
    
    current_idx = get_current_data_point()
    
    # Return last N points up to current index
    start_idx = max(0, current_idx - last_n + 1)
    end_idx = current_idx + 1
    
    return training_data[start_idx:end_idx]

@app.get("/api/training/losses/current", response_model=TrainingLoss)
async def get_current_training_loss():
    """Get the current training loss data point"""
    training_data = training_data_manual if training_mode == "manual" else training_data_automated
    if not training_data:
        raise HTTPException(status_code=503, detail="Training data not available")
    
    current_idx = get_current_data_point()
    return training_data[current_idx]

@app.get("/api/training/resources", response_model=List[ResourceMetrics])
async def get_resource_metrics(last_n: Optional[int] = 50):
    """Get recent resource metrics"""
    resource_data = resource_data_manual if training_mode == "manual" else resource_data_automated
    if not resource_data:
        raise HTTPException(status_code=503, detail="Resource data not available")
    
    current_idx = get_current_data_point()
    
    # Return last N points up to current index
    start_idx = max(0, current_idx - last_n + 1)
    end_idx = current_idx + 1
    
    return resource_data[start_idx:end_idx]

@app.get("/api/training/resources/current", response_model=ResourceMetrics)
async def get_current_resource_metrics():
    """Get the current resource metrics data point"""
    resource_data = resource_data_manual if training_mode == "manual" else resource_data_automated
    if not resource_data:
        raise HTTPException(status_code=503, detail="Resource data not available")
    
    current_idx = get_current_data_point()
    return resource_data[current_idx]

@app.get("/api/training/status/{job_id}", response_model=TrainingStatus)
async def get_training_status(job_id: str):
    """Get current training status for a job"""
    training_data = training_data_manual if training_mode == "manual" else training_data_automated
    if not training_data:
        raise HTTPException(status_code=503, detail="Training data not available")
    
    current_idx = get_current_data_point()
    current_data = training_data[current_idx]
    
    # Calculate progress
    total_data_points = len(training_data)
    progress_percent = ((current_idx + 1) / total_data_points) * 100
    
    # Calculate timing
    elapsed_time = datetime.now() - start_time
    if progress_percent > 0:
        total_estimated = elapsed_time / (progress_percent / 100)
        remaining_time = total_estimated - elapsed_time
    else:
        remaining_time = timedelta(seconds=0)
    
    status = "completed" if is_completed else "running"
    
    return TrainingStatus(
        job_id=job_id,
        status=status,
        current_epoch=current_data.epoch,
        total_epochs=3,  # Based on our data
        progress_percent=round(progress_percent, 1),
        elapsed_time=str(elapsed_time).split('.')[0],  # Remove microseconds
        estimated_remaining=str(remaining_time).split('.')[0],
        current_step=current_data.step,
        total_steps=total_data_points
    )

@app.get("/api/training/summary")
async def get_training_summary():
    """Get overall training summary"""
    training_data = training_data_manual if training_mode == "manual" else training_data_automated
    resource_data = resource_data_manual if training_mode == "manual" else resource_data_automated
    
    if not training_data or not resource_data:
        raise HTTPException(status_code=503, detail="Training data not available")
    
    current_idx = get_current_data_point()
    current_loss = training_data[current_idx]
    current_resources = resource_data[current_idx]
    
    return {
        "training_mode": training_mode,
        "is_completed": is_completed,
        "current_iteration": current_iteration,
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
        "elapsed_time": str(datetime.now() - start_time).split('.')[0],
        "data_point": f"{current_idx + 1}/{len(training_data)}"
    }

@app.websocket("/ws/training/{job_id}")
async def websocket_training_data(websocket, job_id: str):
    """WebSocket endpoint for real-time training data"""
    await websocket.accept()
    
    try:
        while True:
            training_data = training_data_manual if training_mode == "manual" else training_data_automated
            resource_data = resource_data_manual if training_mode == "manual" else resource_data_automated
            
            if training_data and resource_data:
                current_idx = get_current_data_point()
                
                # Send combined data
                data = {
                    "job_id": job_id,
                    "timestamp": datetime.now().isoformat(),
                    "training_mode": training_mode,
                    "is_completed": is_completed,
                    "training": training_data[current_idx].dict(),
                    "resources": resource_data[current_idx].dict(),
                    "iteration": current_idx,
                    "total": len(training_data)
                }
                
                await websocket.send_json(data)
            
            # Send data every 3 seconds to match our data granularity
            await asyncio.sleep(3)
            
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()

@app.post("/api/training/mode/{mode}")
async def set_training_mode(mode: str):
    """Set training mode (manual or automated)"""
    global training_mode, start_time, current_iteration, is_completed
    
    if mode not in ["manual", "automated"]:
        raise HTTPException(status_code=400, detail="Mode must be 'manual' or 'automated'")
    
    training_mode = mode
    start_time = datetime.now()
    current_iteration = 0
    is_completed = False
    
    return {
        "message": f"Training mode set to {mode}",
        "mode": training_mode,
        "reset": True
    }

@app.get("/api/training/mode")
async def get_training_mode():
    """Get current training mode"""
    return {
        "mode": training_mode,
        "is_completed": is_completed,
        "current_iteration": current_iteration
    }

if __name__ == "__main__":
    print("Starting Mock Training API...")
    print("Loading CSV data...")
    
    # Make sure data is loaded before starting
    load_csv_data()
    
    training_data = training_data_manual if training_mode == "manual" else training_data_automated
    resource_data = resource_data_manual if training_mode == "manual" else resource_data_automated
    
    if not training_data or not resource_data:
        print("Warning: No data loaded. Please check CSV files.")
    else:
        print(f"Loaded data for {training_mode} mode")
    
    print(f"Server will run on http://localhost:8001")
    print("Available endpoints:")
    print("  - GET /api/training/losses")
    print("  - GET /api/training/resources")  
    print("  - GET /api/training/status/{job_id}")
    print("  - GET /api/training/summary")
    print("  - POST /api/training/mode/{mode}")
    print("  - GET /api/training/mode")
    print("  - WS /ws/training/{job_id}")
    
    uvicorn.run(
        "mock_training_api:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
