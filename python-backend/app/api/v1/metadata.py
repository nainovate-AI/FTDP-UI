
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from services.job_configuration import JobConfiguration

router = APIRouter(prefix="/api", tags=["metadata"])

@router.get("/metadata")
async def get_metadata():
    try:
        return JobConfiguration.get_metadata()
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Metadata file not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load metadata: {str(e)}")

@router.post("/metadata")
async def update_metadata(updates: Dict[str, Any]):
    try:
        success = JobConfiguration.update_metadata(updates)
        if success:
            return {"success": True, "message": "Metadata updated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to update metadata")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update metadata: {str(e)}")

@router.get("/hyperparameter-config")
async def get_hyperparameter_config():
    try:
        return JobConfiguration.get_hyperparameter_config()
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Hyperparameter config file not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load hyperparameter config: {str(e)}")

@router.post("/hyperparameter-config")
async def update_hyperparameter_config(config_data: Dict[str, Any]):
    try:
        success = JobConfiguration.update_hyperparameter_config(config_data)
        if success:
            return {"success": True, "message": "Hyperparameter config updated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to update hyperparameter config")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update hyperparameter config: {str(e)}")

@router.get("/hyperparameter-config/{uid}")
async def get_hyperparameter_by_uid(uid: str):
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

@router.get("/job-configuration")
async def get_job_configuration():
    try:
        return JobConfiguration.get_job_configuration()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get job configuration: {str(e)}")

@router.get("/job-configuration/validate")
async def validate_job_configuration():
    try:
        return JobConfiguration.validate_job_configuration()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to validate job configuration: {str(e)}")

@router.get("/dataset-by-uid/{uid}")
async def get_dataset_by_uid(uid: str):
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

@router.get("/model-by-uid/{uid}")
async def get_model_by_uid(uid: str):
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
