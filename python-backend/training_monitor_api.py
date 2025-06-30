"""
FastAPI backend for serving training monitoring data
Provides real-time mock data for training losses and resource metrics
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

app = FastAPI(title="Training Monitor API", version="1.0.0")

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

# Global data storage
training_data: List[TrainingLoss] = []
resource_data: List[ResourceMetrics] = []
current_index = 0
start_time = datetime.now()

def load_csv_data():
    """Load data from CSV files"""
    global training_data, resource_data
    
    try:
        # Get the directory where this script is located
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Load training losses
        losses_path = os.path.join(script_dir, "training_losses.csv")
        if os.path.exists(losses_path):
            df_losses = pd.read_csv(losses_path)
            training_data = [TrainingLoss(**row) for _, row in df_losses.iterrows()]
            print(f"Loaded {len(training_data)} training loss records")
        else:
            print(f"Training losses CSV not found at: {losses_path}")
        
        # Load resource metrics
        resources_path = os.path.join(script_dir, "resource_metrics.csv")
        if os.path.exists(resources_path):
            df_resources = pd.read_csv(resources_path)
            resource_data = [ResourceMetrics(**row) for _, row in df_resources.iterrows()]
            print(f"Loaded {len(resource_data)} resource metric records")
        else:
            print(f"Resource metrics CSV not found at: {resources_path}")
            
    except Exception as e:
        print(f"Error loading CSV data: {e}")

def get_current_data_point():
    """Get current data point based on elapsed time"""
    global current_index, start_time
    
    # Calculate elapsed seconds since start
    elapsed_seconds = (datetime.now() - start_time).total_seconds()
    
    # Each row represents 3 seconds, so calculate the index
    current_index = int(elapsed_seconds / 3) % len(training_data)
    
    return current_index

@app.on_event("startup")
async def startup_event():
    """Load data when the server starts"""
    load_csv_data()
    print("Training Monitor API started successfully!")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Training Monitor API",
        "status": "running",
        "data_points": len(training_data),
        "uptime_seconds": (datetime.now() - start_time).total_seconds()
    }

@app.get("/api/training/losses", response_model=List[TrainingLoss])
async def get_training_losses(last_n: Optional[int] = 50):
    """Get recent training losses"""
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
    if not training_data:
        raise HTTPException(status_code=503, detail="Training data not available")
    
    current_idx = get_current_data_point()
    return training_data[current_idx]

@app.get("/api/training/resources", response_model=List[ResourceMetrics])
async def get_resource_metrics(last_n: Optional[int] = 50):
    """Get recent resource metrics"""
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
    if not resource_data:
        raise HTTPException(status_code=503, detail="Resource data not available")
    
    current_idx = get_current_data_point()
    return resource_data[current_idx]

@app.get("/api/training/status/{job_id}", response_model=TrainingStatus)
async def get_training_status(job_id: str):
    """Get current training status for a job"""
    if not training_data:
        raise HTTPException(status_code=503, detail="Training data not available")
    
    current_idx = get_current_data_point()
    current_data = training_data[current_idx]
    
    # Calculate progress
    total_data_points = len(training_data)
    progress_percent = (current_idx / total_data_points) * 100
    
    # Calculate timing
    elapsed_time = datetime.now() - start_time
    if progress_percent > 0:
        total_estimated = elapsed_time / (progress_percent / 100)
        remaining_time = total_estimated - elapsed_time
    else:
        remaining_time = timedelta(seconds=0)
    
    return TrainingStatus(
        job_id=job_id,
        status="running" if current_idx < total_data_points - 1 else "completed",
        current_epoch=current_data.epoch,
        total_epochs=3,  # Based on our data
        progress_percent=round(progress_percent, 1),
        elapsed_time=str(elapsed_time).split('.')[0],  # Remove microseconds
        estimated_remaining=str(remaining_time).split('.')[0],
        current_step=current_data.step,
        total_steps=101  # Based on our data
    )

@app.get("/api/training/summary")
async def get_training_summary():
    """Get overall training summary"""
    if not training_data or not resource_data:
        raise HTTPException(status_code=503, detail="Training data not available")
    
    current_idx = get_current_data_point()
    current_loss = training_data[current_idx]
    current_resources = resource_data[current_idx]
    
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
        "elapsed_time": str(datetime.now() - start_time).split('.')[0],
        "data_point": f"{current_idx + 1}/{len(training_data)}"
    }

@app.websocket("/ws/training/{job_id}")
async def websocket_training_data(websocket, job_id: str):
    """WebSocket endpoint for real-time training data"""
    await websocket.accept()
    
    try:
        while True:
            if training_data and resource_data:
                current_idx = get_current_data_point()
                
                # Send combined data
                data = {
                    "job_id": job_id,
                    "timestamp": datetime.now().isoformat(),
                    "training": training_data[current_idx].dict(),
                    "resources": resource_data[current_idx].dict(),
                    "index": current_idx,
                    "total": len(training_data)
                }
                
                await websocket.send_json(data)
            
            # Send data every 3 seconds to match our data granularity
            await asyncio.sleep(3)
            
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()

if __name__ == "__main__":
    print("Starting Training Monitor API...")
    print("Loading CSV data...")
    
    # Make sure data is loaded before starting
    load_csv_data()
    
    if not training_data or not resource_data:
        print("Warning: No data loaded. Please check CSV files.")
    
    print(f"Server will run on http://localhost:8001")
    print("Available endpoints:")
    print("  - GET /api/training/losses")
    print("  - GET /api/training/resources")  
    print("  - GET /api/training/status/{job_id}")
    print("  - GET /api/training/summary")
    print("  - WS /ws/training/{job_id}")
    
    uvicorn.run(
        "training_monitor_api:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
