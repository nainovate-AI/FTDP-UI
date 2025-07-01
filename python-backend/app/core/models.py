from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class JobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class DatasetCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    file_path: str

    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()

class DatasetResponse(BaseModel):
    uid: str
    name: str
    description: Optional[str]
    file_path: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class JobCreate(BaseModel):
    name: str
    dataset_uid: str
    model_uid: str
    hyperparameters: dict

class JobResponse(BaseModel):
    uid: str
    name: str
    status: JobStatus
    created_at: datetime
    progress: float = Field(ge=0, le=100)
