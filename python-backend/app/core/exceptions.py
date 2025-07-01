from fastapi import HTTPException, status

class FTDPException(Exception):
    """Base exception for FTDP"""
    pass

class DatasetNotFound(FTDPException):
    pass

class ModelNotFound(FTDPException):
    pass

def dataset_not_found_handler(request, exc: DatasetNotFound):
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")

def model_not_found_handler(request, exc: ModelNotFound):
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found")
