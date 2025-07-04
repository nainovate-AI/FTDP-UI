
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from services.dataset_selection import DatasetSelection

router = APIRouter(prefix="/api/datasets", tags=["datasets"])

@router.get("")
async def get_datasets():
    return DatasetSelection.load_datasets()

@router.get("/{uid}")
async def get_dataset(uid: str):
    ds = DatasetSelection.get_dataset_by_uid(uid)
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return ds

@router.post("")
async def add_dataset(dataset: Dict[str, Any]):
    ok = DatasetSelection.add_dataset(dataset)
    if not ok:
        raise HTTPException(status_code=500, detail="Failed to add dataset")
    return {"success": True}

@router.put("/{uid}")
async def update_dataset(uid: str, updates: Dict[str, Any]):
    ok = DatasetSelection.update_dataset(uid, updates)
    if not ok:
        raise HTTPException(status_code=404, detail="Dataset not found or update failed")
    return {"success": True}

@router.delete("/{uid}")
async def delete_dataset(uid: str):
    ok = DatasetSelection.delete_dataset(uid)
    if not ok:
        raise HTTPException(status_code=404, detail="Dataset not found or delete failed")
    return {"success": True}
