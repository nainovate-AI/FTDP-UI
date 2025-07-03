import os
import shutil
import tempfile
import csv
import json
import uuid
from pathlib import Path
from typing import Optional, Dict, Any, List, Union
import logging
import aiofiles
import pandas as pd

logger = logging.getLogger(__name__)

def ensure_directory_exists(directory_path: str) -> bool:
    """Ensure directory exists, create if it doesn't"""
    try:
        Path(directory_path).mkdir(parents=True, exist_ok=True)
        return True
    except Exception as e:
        logger.error(f"Failed to create directory {directory_path}: {e}")
        return False

def safe_file_move(source: str, destination: str) -> bool:
    """Safely move file with error handling"""
    try:
        ensure_directory_exists(str(Path(destination).parent))
        shutil.move(source, destination)
        return True
    except Exception as e:
        logger.error(f"Failed to move file from {source} to {destination}: {e}")
        return False

def get_file_size_mb(file_path: str) -> Optional[float]:
    """Get file size in megabytes"""
    try:
        return os.path.getsize(file_path) / (1024 * 1024)
    except Exception as e:
        logger.error(f"Failed to get file size for {file_path}: {e}")
        return None

def clean_temp_files(temp_dir: str) -> bool:
    """Clean temporary files in directory"""
    try:
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
        return True
    except Exception as e:
        logger.error(f"Failed to clean temp directory {temp_dir}: {e}")
        return False

def validate_csv_file(file_path: str) -> Dict[str, Any]:
    """Validate CSV file format and structure"""
    try:
        df = pd.read_csv(file_path, nrows=5)  # Read first 5 rows for validation
        
        validation_result = {
            "is_valid": True,
            "errors": [],
            "warnings": [],
            "columns": df.columns.tolist(),
            "row_count": len(df),
            "has_required_columns": False
        }
        
        # Check for required columns
        required_columns = ['input', 'output']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            validation_result["errors"].append(f"Missing required columns: {', '.join(missing_columns)}")
        else:
            validation_result["has_required_columns"] = True
        
        # Check for empty file
        if df.empty:
            validation_result["errors"].append("CSV file is empty")
            validation_result["is_valid"] = False
        
        return validation_result
        
    except Exception as e:
        return {
            "is_valid": False,
            "errors": [f"Failed to validate CSV: {str(e)}"],
            "warnings": [],
            "columns": [],
            "row_count": 0,
            "has_required_columns": False
        }

def preview_csv_file(file_path: str, max_rows: int = 5) -> Dict[str, Any]:
    """Generate preview of CSV file content"""
    try:
        df = pd.read_csv(file_path, nrows=max_rows)
        
        preview_data = []
        for _, row in df.iterrows():
            row_dict = {}
            for col in df.columns:
                value = row[col]
                if pd.isna(value):
                    row_dict[col] = None
                else:
                    row_dict[col] = str(value)
            preview_data.append(row_dict)
        
        return {
            "success": True,
            "data": preview_data,
            "columns": df.columns.tolist(),
            "preview_rows": len(preview_data)
        }
        
    except Exception as e:
        logger.error(f"Failed to preview CSV {file_path}: {e}")
        return {
            "success": False,
            "error": str(e),
            "data": [],
            "columns": [],
            "preview_rows": 0
        }

async def save_uploaded_file(file_content: bytes, filename: str, upload_dir: str = "uploads") -> str:
    """Save uploaded file to specified directory"""
    try:
        # Ensure upload directory exists
        ensure_directory_exists(upload_dir)
        
        # Generate unique filename to avoid conflicts
        file_id = str(uuid.uuid4())[:8]
        file_extension = Path(filename).suffix
        safe_filename = f"{file_id}_{filename}"
        file_path = os.path.join(upload_dir, safe_filename)
        
        # Save file asynchronously
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(file_content)
        
        logger.info(f"Successfully saved uploaded file: {safe_filename}")
        return file_path
        
    except Exception as e:
        logger.error(f"Failed to save uploaded file {filename}: {e}")
        raise e

def delete_file_safe(file_path: str) -> bool:
    """Safely delete a file with error handling"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Successfully deleted file: {file_path}")
            return True
        return False
    except Exception as e:
        logger.error(f"Failed to delete file {file_path}: {e}")
        return False

def read_json_file(file_path: str) -> Optional[Dict[str, Any]]:
    """Read and parse JSON file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to read JSON file {file_path}: {e}")
        return None

def write_json_file(file_path: str, data: Dict[str, Any]) -> bool:
    """Write data to JSON file"""
    try:
        ensure_directory_exists(str(Path(file_path).parent))
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        logger.error(f"Failed to write JSON file {file_path}: {e}")
        return False

def get_temp_directory() -> str:
    """Get or create temporary directory for file processing"""
    temp_dir = os.path.join(tempfile.gettempdir(), "ftdp_temp")
    ensure_directory_exists(temp_dir)
    return temp_dir

def cleanup_old_files(directory: str, max_age_hours: int = 24) -> int:
    """Clean up old files in directory older than specified hours"""
    import time
    
    cleaned_count = 0
    current_time = time.time()
    max_age_seconds = max_age_hours * 3600
    
    try:
        for filename in os.listdir(directory):
            file_path = os.path.join(directory, filename)
            if os.path.isfile(file_path):
                file_age = current_time - os.path.getmtime(file_path)
                if file_age > max_age_seconds:
                    if delete_file_safe(file_path):
                        cleaned_count += 1
    except Exception as e:
        logger.error(f"Failed to cleanup old files in {directory}: {e}")
    
    return cleaned_count
