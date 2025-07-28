
from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any
from services.model_selection import ModelSelection

router = APIRouter(prefix="/api/models", tags=["models"])

@router.get("")
async def get_models():
    return ModelSelection.load_models()

@router.get("/search")
async def search_models(query: str = Query(..., min_length=2), limit: int = 10):
    try:
        results = ModelSelection.search_huggingface_models(query, limit)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"HuggingFace search failed: {str(e)}")

@router.post("")
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

@router.delete("/{model_id:path}")
async def remove_model(model_id: str):
    try:
        result = ModelSelection.remove_model(model_id)
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=404, detail=result["message"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove model: {str(e)}")

@router.get("/check/{model_id:path}")
async def check_model_exists(model_id: str):
    try:
        exists = ModelSelection.model_exists(model_id)
        return {"exists": exists, "model_id": model_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check model: {str(e)}")
