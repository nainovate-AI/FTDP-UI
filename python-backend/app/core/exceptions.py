from fastapi import HTTPException, status

class FTDPException(Exception):
    """Base exception for FTDP"""
    pass

class DatasetNotFound(FTDPException):
    """Raised when a dataset is not found"""
    pass

class ModelNotFound(FTDPException):
    """Raised when a model is not found"""
    pass

class JobNotFound(FTDPException):
    """Raised when a job is not found"""
    pass

class ValidationError(FTDPException):
    """Raised when validation fails"""
    pass

class ConfigurationError(FTDPException):
    """Raised when configuration is invalid"""
    pass

class FileProcessingError(FTDPException):
    """Raised when file processing fails"""
    pass

class TrainingError(FTDPException):
    """Raised when training operation fails"""
    pass

def dataset_not_found_handler(request, exc: DatasetNotFound):
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")

def model_not_found_handler(request, exc: ModelNotFound):
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found")

def job_not_found_handler(request, exc: JobNotFound):
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

def validation_error_handler(request, exc: ValidationError):
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

def configuration_error_handler(request, exc: ConfigurationError):
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Configuration error: {str(exc)}")

def file_processing_error_handler(request, exc: FileProcessingError):
    return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"File processing error: {str(exc)}")

def training_error_handler(request, exc: TrainingError):
    return HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Training error: {str(exc)}")
