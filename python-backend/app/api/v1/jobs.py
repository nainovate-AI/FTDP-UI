
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from services.job_configuration import JobConfiguration
from datetime import datetime
from ..v1.training import get_current_training_index, training_data
import logging

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

@router.post("")
async def create_finetuning_job(job_data: Dict[str, Any]):
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

@router.get("")
async def get_all_jobs():
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

@router.get("/current")
async def get_current_jobs():
    try:
        return JobConfiguration.load_json_file("current-jobs.json")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get current jobs: {str(e)}")

@router.get("/past")
async def get_past_jobs():
    try:
        return JobConfiguration.load_json_file("past-jobs.json")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get past jobs: {str(e)}")

@router.get("/statistics")
async def get_job_statistics():
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

@router.get("/{uid}")
async def get_job_by_uid(uid: str):
    try:
        current_jobs = JobConfiguration.load_json_file("current-jobs.json")
        for job in current_jobs.get("jobs", []):
            if job.get("uid") == uid:
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
        past_jobs = JobConfiguration.load_json_file("past-jobs.json")
        for job in past_jobs.get("jobs", []):
            if job.get("uid") == uid:
                return job
        raise HTTPException(status_code=404, detail=f"Job UID not found: {uid}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get job: {str(e)}")
