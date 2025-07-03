
import os
import pandas as pd
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel

# Global variables for training data
training_data = []
resource_data = []
training_start_time = datetime.now()
current_mode = "manual"  # "manual" or "automated"

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

def load_training_data():
    """Load training data from CSV files"""
    global training_data, resource_data
    
    try:
        # Get the directory path (relative to where this script runs from)
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        data_dir = os.path.join(backend_dir, "data")
        # Load training metrics based on current mode
        training_file = f"training_metrics_{current_mode}.csv"
        training_path = os.path.join(data_dir, training_file)
        
        if os.path.exists(training_path):
            df_training = pd.read_csv(training_path)
            # Convert DataFrame to list of TrainingLoss objects
            training_data = []
            for _, row in df_training.iterrows():
                training_data.append(TrainingLoss(
                    timestamp=int(row['iteration']),
                    epoch=int(row['epoch']),
                    step=int(row['step']),
                    train_loss=float(row['train_loss']),
                    validation_loss=float(row['validation_loss']),
                    learning_rate=float(row['learning_rate']),
                    batch_size=int(row['batch_size'])
                ))
            print(f"Loaded {len(training_data)} training records from {training_file}")
        else:
            print(f"Training file not found: {training_path}")
        
        # Load resource metrics based on current mode
        resource_file = f"resource_metrics_{current_mode}.csv"
        resource_path = os.path.join(data_dir, resource_file)
        
        if os.path.exists(resource_path):
            df_resources = pd.read_csv(resource_path)
            # Convert DataFrame to list of ResourceMetrics objects
            resource_data = []
            for _, row in df_resources.iterrows():
                resource_data.append(ResourceMetrics(
                    timestamp=int(row['iteration']),
                    cpu_percent=float(row['cpu_percent']),
                    ram_used_gb=float(row['ram_used_gb']),
                    ram_total_gb=float(row['ram_total_gb']),
                    gpu_percent=float(row['gpu_percent']),
                    vram_used_gb=float(row['vram_used_gb']),
                    vram_total_gb=float(row['vram_total_gb']),
                    disk_used_gb=float(row['disk_used_gb']),
                    disk_total_gb=float(row['disk_total_gb']),
                    gpu_temp=int(round(row['gpu_temp'])),
                    cpu_temp=int(round(row['cpu_temp'])),
                    network_in_mbps=float(row['network_in_mbps']),
                    network_out_mbps=float(row['network_out_mbps'])
                ))
            print(f"Loaded {len(resource_data)} resource records from {resource_file}")
        else:
            print(f"Resource file not found: {resource_path}")
            
    except Exception as e:
        print(f"Error loading training data: {e}")

def get_current_training_index():
    """Calculate current training index based on elapsed time"""
    global training_data, training_start_time
    if not training_data:
        return 0
    elapsed_seconds = (datetime.now() - training_start_time).total_seconds()
    # Each data point represents 3 seconds of training
    index = int(elapsed_seconds / 3) % len(training_data)
    return index

# Initialize data on module load
load_training_data()

router = APIRouter(prefix="/api/training", tags=["training"])

@router.get("/mode")
async def get_training_mode():
    """Get current training mode"""
    return {
        "mode": current_mode,
        "data_points": len(training_data),
        "resource_points": len(resource_data)
    }

@router.post("/mode/{mode}")
async def set_training_mode(mode: str):
    """Set training mode and reload data"""
    global current_mode, training_start_time
    
    if mode not in ["manual", "automated"]:
        raise HTTPException(status_code=400, detail="Mode must be 'manual' or 'automated'")
    
    current_mode = mode
    training_start_time = datetime.now()  # Reset timer
    load_training_data()  # Reload data for new mode
    
    return {
        "message": f"Training mode set to {mode}",
        "mode": current_mode,
        "data_points": len(training_data),
        "reset": True
    }

@router.get("/losses", response_model=List[TrainingLoss])
async def get_training_losses(last_n: Optional[int] = 20):
    if not training_data:
        raise HTTPException(status_code=503, detail="Training data not available")
    current_idx = get_current_training_index()
    start_idx = max(0, current_idx - last_n + 1)
    end_idx = current_idx + 1
    return training_data[start_idx:end_idx]

@router.get("/losses/current", response_model=TrainingLoss)
async def get_current_training_loss():
    if not training_data:
        raise HTTPException(status_code=503, detail="Training data not available")
    current_idx = get_current_training_index()
    return training_data[current_idx]

@router.get("/resources", response_model=List[ResourceMetrics])
async def get_resource_metrics(last_n: Optional[int] = 20):
    if not resource_data:
        raise HTTPException(status_code=503, detail="Resource data not available")
    current_idx = get_current_training_index()
    start_idx = max(0, current_idx - last_n + 1)
    end_idx = current_idx + 1
    return resource_data[start_idx:end_idx]

@router.get("/resources/current", response_model=ResourceMetrics)
async def get_current_resource_metrics():
    if not resource_data:
        raise HTTPException(status_code=503, detail="Resource data not available")
    current_idx = get_current_training_index()
    return resource_data[current_idx]

@router.get("/status/{job_id}", response_model=TrainingStatus)
async def get_training_status(job_id: str):
    if not training_data:
        raise HTTPException(status_code=503, detail="Training data not available")
    current_idx = get_current_training_index()
    current_data = training_data[current_idx]
    total_data_points = len(training_data)
    progress_percent = ((current_idx + 1) / total_data_points) * 100
    elapsed_time = datetime.now() - training_start_time
    if progress_percent > 0:
        total_estimated = elapsed_time / (progress_percent / 100)
        remaining_time = total_estimated - elapsed_time
    else:
        remaining_time = timedelta(seconds=0)
    
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
    
    # Determine status based on progress
    status = "completed" if current_idx >= total_data_points - 1 else "running"
    
    return TrainingStatus(
        job_id=job_id,
        status=status,
        current_epoch=current_data.epoch,
        total_epochs=3,
        progress_percent=round(progress_percent, 1),
        elapsed_time=format_timedelta(elapsed_time),
        estimated_remaining=f"~{format_timedelta(remaining_time)}",
        current_step=current_data.step,
        total_steps=total_data_points
    )

@router.get("/summary")
async def get_training_summary():
    if not training_data or not resource_data:
        raise HTTPException(status_code=503, detail="Training data not available")
    current_idx = get_current_training_index()
    current_loss = training_data[current_idx]
    current_resources = resource_data[current_idx]
    elapsed_time = datetime.now() - training_start_time
    
    return {
        "training_mode": current_mode,
        "current_epoch": current_loss.epoch,
        "current_step": current_loss.step,
        "current_train_loss": round(current_loss.train_loss, 4),
        "current_val_loss": round(current_loss.validation_loss, 4),
        "gpu_utilization": round(current_resources.gpu_percent, 1),
        "memory_usage": {
            "ram_used": round(current_resources.ram_used_gb, 2),
            "ram_total": round(current_resources.ram_total_gb, 2),
            "vram_used": round(current_resources.vram_used_gb, 2),
            "vram_total": round(current_resources.vram_total_gb, 2)
        },
        "temperatures": {
            "gpu": current_resources.gpu_temp,
            "cpu": current_resources.cpu_temp
        },
        "elapsed_time": str(elapsed_time).split('.')[0],
        "data_point": f"{current_idx + 1}/{len(training_data)}",
        "progress_percent": round(((current_idx + 1) / len(training_data)) * 100, 1)
    }
