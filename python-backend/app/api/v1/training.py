
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel

# These would be imported or managed globally in a real app
training_data = []
resource_data = []
training_start_time = datetime.now()

def get_current_training_index():
    global training_data, training_start_time
    if not training_data:
        return 0
    elapsed_seconds = (datetime.now() - training_start_time).total_seconds()
    return int(elapsed_seconds / 3) % len(training_data)

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

router = APIRouter(prefix="/api/training", tags=["training"])

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
    progress_percent = (current_idx / total_data_points) * 100
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
    return TrainingStatus(
        job_id=job_id,
        status="running" if current_idx < total_data_points - 1 else "completed",
        current_epoch=current_data.epoch,
        total_epochs=3,
        progress_percent=round(progress_percent, 1),
        elapsed_time=format_timedelta(elapsed_time),
        estimated_remaining=f"~{format_timedelta(remaining_time)}",
        current_step=current_data.step,
        total_steps=101
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
