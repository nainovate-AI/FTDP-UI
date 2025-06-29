import json
import os
from typing import Dict, Any, Optional
import logging
import time
import hashlib

logger = logging.getLogger(__name__)

class JobConfiguration:
    """Service class for handling job configuration data from JSON files"""
    
    # Paths to JSON data files (relative to the python-backend directory)
    METADATA_PATH = "../../src/data/metadata.json"
    HYPERPARAMETER_CONFIG_PATH = "../../src/data/hyperparameter-config.json"
    DATASETS_PATH = "../../src/data/datasets.json"
    MODELS_PATH = "../../src/data/models.json"
    JOBS_PATH = "../../src/data/jobs.json"
    
    @classmethod
    def _load_json_file(cls, file_path: str) -> Dict[str, Any]:
        """Load and parse a JSON file"""
        try:
            full_path = os.path.join(os.path.dirname(__file__), file_path)
            with open(full_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.error(f"JSON file not found: {file_path}")
            raise FileNotFoundError(f"Configuration file not found: {file_path}")
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in file {file_path}: {str(e)}")
            raise ValueError(f"Invalid JSON format in {file_path}: {str(e)}")
        except Exception as e:
            logger.error(f"Error loading JSON file {file_path}: {str(e)}")
            raise Exception(f"Failed to load {file_path}: {str(e)}")
    
    @classmethod
    def _save_json_file(cls, file_path: str, data: Dict[str, Any]) -> bool:
        """Save data to a JSON file"""
        try:
            full_path = os.path.join(os.path.dirname(__file__), file_path)
            with open(full_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            logger.error(f"Error saving JSON file {file_path}: {str(e)}")
            return False
    
    @classmethod
    def get_metadata(cls) -> Dict[str, Any]:
        """Load metadata.json"""
        return cls._load_json_file(cls.METADATA_PATH)
    
    @classmethod
    def update_metadata(cls, updates: Dict[str, Any]) -> bool:
        """Update metadata.json with new data"""
        try:
            current_metadata = cls.get_metadata()
            current_metadata.update(updates)
            return cls._save_json_file(cls.METADATA_PATH, current_metadata)
        except Exception as e:
            logger.error(f"Failed to update metadata: {str(e)}")
            return False
    
    @classmethod
    def get_hyperparameter_config(cls) -> Dict[str, Any]:
        """Load hyperparameter-config.json"""
        return cls._load_json_file(cls.HYPERPARAMETER_CONFIG_PATH)
    
    @classmethod
    def update_hyperparameter_config(cls, config_data: Dict[str, Any]) -> bool:
        """Update hyperparameter-config.json"""
        return cls._save_json_file(cls.HYPERPARAMETER_CONFIG_PATH, config_data)
    
    @classmethod
    def get_hyperparameter_by_uid(cls, uid: str) -> Optional[Dict[str, Any]]:
        """Get specific hyperparameter configuration by UID"""
        try:
            config_data = cls.get_hyperparameter_config()
            
            # Check if UID is an alias first
            if uid in config_data.get('aliases', {}):
                actual_uid = config_data['aliases'][uid]
                logger.info(f"Resolved alias {uid} to {actual_uid}")
                uid = actual_uid
            
            # Return the configuration
            configs = config_data.get('configs', {})
            if uid in configs:
                return configs[uid]
            else:
                logger.warning(f"Hyperparameter UID not found: {uid}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting hyperparameter config for UID {uid}: {str(e)}")
            return None
    
    @classmethod
    def get_dataset_by_uid(cls, uid: str) -> Optional[Dict[str, Any]]:
        """Get dataset information by UID"""
        try:
            datasets_data = cls._load_json_file(cls.DATASETS_PATH)
            
            # Handle both array format and object format
            if isinstance(datasets_data, list):
                datasets = datasets_data
            else:
                datasets = datasets_data.get('datasets', [])
            
            for dataset in datasets:
                if dataset.get('uid') == uid:
                    return dataset
            
            logger.warning(f"Dataset UID not found: {uid}")
            return None
            
        except Exception as e:
            logger.error(f"Error getting dataset for UID {uid}: {str(e)}")
            return None
    
    @classmethod
    def get_model_by_uid(cls, uid: str) -> Optional[Dict[str, Any]]:
        """Get model information by UID"""
        try:
            models_data = cls._load_json_file(cls.MODELS_PATH)
            
            # Handle both array format and object format
            if isinstance(models_data, dict) and 'models' in models_data:
                models = models_data.get('models', [])
            elif isinstance(models_data, list):
                models = models_data
            else:
                models = []
            
            for model in models:
                # Check both uid and id fields, and handle string/number comparison
                if (str(model.get('uid')) == str(uid) or 
                    str(model.get('id')) == str(uid)):
                    return model
            
            logger.warning(f"Model UID not found: {uid}")
            return None
            
        except Exception as e:
            logger.error(f"Error getting model for UID {uid}: {str(e)}")
            return None
    
    @classmethod
    def get_job_configuration(cls) -> Dict[str, Any]:
        """
        Get complete job configuration by assembling data from metadata 
        and related JSON files based on UIDs
        """
        try:
            # Load metadata
            metadata = cls.get_metadata()
            
            # Get dataset information
            dataset_uid = metadata.get('dataset', {}).get('uid')
            dataset_info = None
            if dataset_uid:
                dataset_info = cls.get_dataset_by_uid(dataset_uid)
                if not dataset_info:
                    logger.warning(f"Dataset not found for UID: {dataset_uid}")
            
            # Get model information
            model_uid = metadata.get('model', {}).get('uid')
            model_info = None
            if model_uid:
                model_info = cls.get_model_by_uid(model_uid)
                if not model_info:
                    logger.warning(f"Model not found for UID: {model_uid}")
            
            # Get hyperparameter configuration
            hyperparameter_uid = metadata.get('hyperparameters', {}).get('uid')
            hyperparameter_config = None
            if hyperparameter_uid:
                hyperparameter_config = cls.get_hyperparameter_by_uid(hyperparameter_uid)
                if not hyperparameter_config:
                    logger.warning(f"Hyperparameter config not found for UID: {hyperparameter_uid}")
            
            # Assemble the complete job configuration
            job_config = {
                "metadata": metadata,
                "model": {
                    "uid": model_uid,
                    "info": model_info,
                    "baseModel": metadata.get('model', {}).get('baseModel', ''),
                    "modelName": metadata.get('model', {}).get('modelName', ''),
                    "provider": metadata.get('model', {}).get('provider', '')
                },
                "dataset": {
                    "uid": dataset_uid,
                    "info": dataset_info,
                    "name": metadata.get('dataset', {}).get('name', ''),
                    "selectedAt": metadata.get('dataset', {}).get('selectedAt', '')
                },
                "hyperparameters": {
                    "uid": hyperparameter_uid,
                    "config": hyperparameter_config
                }
            }
            
            # Flatten hyperparameter config for easier access
            if hyperparameter_config:
                job_config["hyperparameters"].update(hyperparameter_config)
            
            return job_config
            
        except Exception as e:
            logger.error(f"Error assembling job configuration: {str(e)}")
            raise Exception(f"Failed to get job configuration: {str(e)}")
    
    @classmethod
    def validate_job_configuration(cls) -> Dict[str, Any]:
        """
        Validate that all required UIDs in metadata exist in their respective files
        """
        try:
            metadata = cls.get_metadata()
            validation_result = {
                "isValid": True,
                "errors": [],
                "warnings": []
            }
            
            # Check dataset UID
            dataset_uid = metadata.get('dataset', {}).get('uid')
            if dataset_uid:
                dataset_info = cls.get_dataset_by_uid(dataset_uid)
                if not dataset_info:
                    validation_result["isValid"] = False
                    validation_result["errors"].append(f"Dataset UID not found: {dataset_uid}")
            else:
                validation_result["warnings"].append("No dataset UID specified in metadata")
            
            # Check model UID
            model_uid = metadata.get('model', {}).get('uid')
            if model_uid:
                model_info = cls.get_model_by_uid(model_uid)
                if not model_info:
                    validation_result["isValid"] = False
                    validation_result["errors"].append(f"Model UID not found: {model_uid}")
            else:
                validation_result["warnings"].append("No model UID specified in metadata")
            
            # Check hyperparameter UID
            hyperparameter_uid = metadata.get('hyperparameters', {}).get('uid')
            if hyperparameter_uid:
                hyperparameter_config = cls.get_hyperparameter_by_uid(hyperparameter_uid)
                if not hyperparameter_config:
                    validation_result["isValid"] = False
                    validation_result["errors"].append(f"Hyperparameter UID not found: {hyperparameter_uid}")
            else:
                validation_result["warnings"].append("No hyperparameter UID specified in metadata")
            
            return validation_result
            
        except Exception as e:
            logger.error(f"Error validating job configuration: {str(e)}")
            return {
                "isValid": False,
                "errors": [f"Validation failed: {str(e)}"],
                "warnings": []
            }
    
    @classmethod
    def generate_job_uid(cls, job_data: Dict[str, Any]) -> str:
        """Generate a unique job UID based on configuration and timestamp"""
        # Create a hash from the job configuration
        config_str = json.dumps({
            'name': job_data.get('name', ''),
            'model_uid': job_data.get('configuration', {}).get('model', {}).get('uid', ''),
            'dataset_uid': job_data.get('configuration', {}).get('dataset', {}).get('uid', ''),
            'hyperparameter_uid': job_data.get('configuration', {}).get('hyperparameters', {}).get('uid', ''),
            'timestamp': job_data.get('createdAt', '')
        }, sort_keys=True)
        
        # Create a short hash
        hash_obj = hashlib.md5(config_str.encode())
        short_hash = hash_obj.hexdigest()[:8]
        
        # Generate timestamp-based UID
        timestamp = int(time.time() * 1000)  # milliseconds
        return f"job_{timestamp}_{short_hash}"
    
    @classmethod
    def create_finetuning_job(cls, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new finetuning job and save it to jobs.json
        
        Args:
            job_data: Dictionary containing job information including:
                - name: Job name
                - description: Job description
                - tags: List of tags
                - configuration: Complete job configuration
                - modelSaving: Model saving options
        
        Returns:
            Dictionary with success status and job UID
        """
        try:
            # Load existing jobs
            try:
                jobs_data = cls._load_json_file(cls.JOBS_PATH)
            except FileNotFoundError:
                jobs_data = {"jobs": []}
            
            # Generate unique job UID
            timestamp = int(time.time() * 1000)
            job_uid = cls.generate_job_uid(job_data)
            
            # Create the complete job record
            job_record = {
                "uid": job_uid,
                "name": job_data.get('name', ''),
                "description": job_data.get('description', ''),
                "tags": job_data.get('tags', []),
                "status": "created",
                "createdAt": job_data.get('createdAt', time.strftime('%Y-%m-%dT%H:%M:%S.000Z')),
                "lastModified": time.strftime('%Y-%m-%dT%H:%M:%S.000Z'),
                "configuration": job_data.get('configuration', {}),
                "modelSaving": job_data.get('modelSaving', {}),
                "training": {
                    "startedAt": None,
                    "completedAt": None,
                    "progress": 0,
                    "logs": [],
                    "metrics": {}
                },
                "results": {
                    "finalModelPath": None,
                    "huggingfaceRepo": None,
                    "checkpoints": [],
                    "performance": {}
                }
            }
            
            # Add to jobs list
            if 'jobs' not in jobs_data:
                jobs_data['jobs'] = []
            
            jobs_data['jobs'].append(job_record)
            
            # Save updated jobs data
            success = cls._save_json_file(cls.JOBS_PATH, jobs_data)
            
            if success:
                logger.info(f"Successfully created finetuning job: {job_uid}")
                return {
                    "success": True,
                    "message": "Finetuning job created successfully",
                    "jobUid": job_uid,
                    "job": job_record
                }
            else:
                return {
                    "success": False,
                    "message": "Failed to save job data"
                }
                
        except Exception as e:
            logger.error(f"Error creating finetuning job: {str(e)}")
            return {
                "success": False,
                "message": f"Failed to create job: {str(e)}"
            }
    
    @classmethod
    def get_all_jobs(cls) -> Dict[str, Any]:
        """Get all finetuning jobs"""
        try:
            return cls._load_json_file(cls.JOBS_PATH)
        except FileNotFoundError:
            return {"jobs": []}
        except Exception as e:
            logger.error(f"Error loading jobs: {str(e)}")
            return {"jobs": []}
    
    @classmethod
    def get_job_by_uid(cls, uid: str) -> Optional[Dict[str, Any]]:
        """Get a specific job by UID"""
        try:
            jobs_data = cls.get_all_jobs()
            jobs = jobs_data.get('jobs', [])
            
            for job in jobs:
                if job.get('uid') == uid:
                    return job
            
            logger.warning(f"Job UID not found: {uid}")
            return None
            
        except Exception as e:
            logger.error(f"Error getting job for UID {uid}: {str(e)}")
            return None
