# AI Fine-tuning Dashboard - API Documentation

This document provides comprehensive documentation for all API endpoints in the AI Fine-tuning Dashboard platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Main API Endpoints](#main-api-endpoints)
- [Training Monitor API](#training-monitor-api)
- [WebSocket Connections](#websocket-connections)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

## 🌐 Overview

The AI Fine-tuning Dashboard consists of two main API services:

| Service | Port | Purpose | Documentation |
|---------|------|---------|---------------|
| **Main API** | 8000 | Core application functionality | http://127.0.0.1:8000/docs |
| **Training Monitor** | 8001 | Real-time training metrics | http://127.0.0.1:8001/docs |

### Base URLs
- **Main API**: `http://127.0.0.1:8000`
- **Training API**: `http://127.0.0.1:8001`

---

## 🔐 Authentication

Currently, the API uses placeholder authentication for development. In production, implement proper authentication mechanisms.

### Headers
```http
Content-Type: application/json
Authorization: Bearer <token>  # TODO: Implement in production
```

---

## 🚀 Main API Endpoints

### Health & Status

#### GET `/` - Root Endpoint
**Description**: Basic health check and service information.

```http
GET /
```

**Response**:
```json
{
  "message": "CSV Preview API is running",
  "status": "healthy"
}
```

#### GET `/api/health` - Detailed Health Check
**Description**: Comprehensive health check with system information.

```http
GET /api/health
```

**Response**:
```json
{
  "status": "healthy",
  "service": "CSV Preview API",
  "version": "1.0.0",
  "dependencies": {
    "pandas": "2.1.0",
    "fastapi": "0.104.1"
  },
  "endpoints": {
    "preview": "/api/preview-csv",
    "health": "/api/health"
  }
}
```

---

### 🤖 Models Management

#### GET `/api/models` - Get All Models
**Description**: Retrieve all models in the collection.

```http
GET /api/models
```

**Response**:
```json
{
  "models": [
    {
      "id": "meta-llama/Llama-3.1-70B-Instruct",
      "name": "Llama 3.1 70B Instruct",
      "provider": "Meta",
      "category": "Instruction Following",
      "description": "Large multilingual model with excellent performance",
      "parameters": "70B",
      "contextLength": 131072,
      "license": "Llama 3.1 Community License",
      "downloadSize": "39.6 GB",
      "tags": ["large-model", "multilingual", "powerful"],
      "capabilities": ["advanced-reasoning", "complex-instruction-following"],
      "recommended": false,
      "performance": {
        "speed": "Moderate",
        "accuracy": "Excellent",
        "memoryUsage": "High"
      },
      "useCase": "Complex reasoning, advanced code generation"
    }
  ],
  "categories": ["All Models", "Text Generation", "Code Generation"],
  "providers": ["All Providers", "Meta", "Google", "OpenAI"]
}
```

#### GET `/api/models/search` - Search HuggingFace Models
**Description**: Search for models on HuggingFace Hub.

```http
GET /api/models/search?query=gpt&limit=10
```

**Parameters**:
- `query` (required): Search term (min 2 characters)
- `limit` (optional): Maximum results (default: 10)

**Response**:
```json
[
  {
    "id": "openai-community/gpt2",
    "name": "GPT-2",
    "provider": "OpenAI",
    "category": "Text Generation",
    "description": "Pre-trained text generation model",
    "parameters": "117M",
    "contextLength": 1024,
    "tags": ["gpt2", "text-generation"],
    "downloads": 50000,
    "likes": 1500
  }
]
```

#### POST `/api/models` - Add Model
**Description**: Add a new model to the collection.

```http
POST /api/models
Content-Type: application/json

{
  "id": "test-model/gpt-2",
  "name": "Test GPT-2",
  "provider": "Test Provider",
  "category": "Text Generation",
  "description": "Test model for API testing",
  "parameters": "117M",
  "tags": ["test", "gpt-2"]
}
```

**Response**:
```json
{
  "success": true,
  "model": {
    "id": "test-model/gpt-2",
    "name": "Test GPT-2",
    // ... enhanced model data
  },
  "message": "Successfully added 'Test GPT-2' to your collection"
}
```

#### DELETE `/api/models/{model_id}` - Remove Model
**Description**: Remove a model from the collection.

```http
DELETE /api/models/test-model%2Fgpt-2
```

**Response**:
```json
{
  "success": true,
  "message": "Successfully removed model 'test-model/gpt-2'"
}
```

#### GET `/api/models/check/{model_id}` - Check Model Exists
**Description**: Check if a model exists in the collection.

```http
GET /api/models/check/test-model%2Fgpt-2
```

**Response**:
```json
{
  "exists": true,
  "model_id": "test-model/gpt-2"
}
```

---

### 📁 Dataset Management

#### GET `/api/datasets` - Get All Datasets
**Description**: Retrieve all datasets.

```http
GET /api/datasets
```

**Response**:
```json
[
  {
    "uid": "dataset_1751023766790_b0zqofldb",
    "id": "customer-support-qa",
    "name": "Customer Support Q&A",
    "description": "Customer service questions and responses",
    "tags": ["customer-service", "qa", "support"],
    "columns": ["input", "output"],
    "rows": 1500,
    "size": "2.3 MB",
    "createdAt": "2025-07-01T08:55:24.177Z",
    "validation": {
      "isValid": true,
      "hasRequiredColumns": true,
      "errors": []
    }
  }
]
```

#### POST `/api/preview-csv` - Preview CSV File
**Description**: Upload and preview a CSV file with validation.

```http
POST /api/preview-csv
Content-Type: multipart/form-data

file: [CSV file]
```

**Response**:
```json
{
  "filename": "dataset.csv",
  "columns": ["input", "output"],
  "data": [
    {
      "input": "What is AI?",
      "output": "Artificial Intelligence is the simulation of human intelligence."
    }
  ],
  "validation_errors": [],
  "statistics": {
    "total_rows": 1000,
    "total_columns": 2,
    "file_size_kb": 245.6,
    "preview_rows": 5,
    "has_required_columns": true
  },
  "isNewUpload": true
}
```

---

### 💼 Job Management

#### GET `/api/jobs` - Get All Jobs
**Description**: Retrieve all fine-tuning jobs.

```http
GET /api/jobs
```

**Response**:
```json
{
  "jobs": [
    {
      "uid": "job_1751559451590_15c0ef2a",
      "name": "Customer Support Fine-tuning",
      "description": "Fine-tune model for customer support responses",
      "status": "running",
      "createdAt": "2025-07-03T12:00:00.000Z",
      "lastModified": "2025-07-03T12:30:00.000Z",
      "configuration": {
        "model": {
          "uid": "meta-llama/Llama-3.1-70B-Instruct",
          "name": "Llama 3.1 70B Instruct"
        },
        "dataset": {
          "uid": "dataset_1751023766790_b0zqofldb",
          "name": "Customer Support Q&A"
        },
        "hyperparameters": {
          "uid": "00000005k0008000300100002s",
          "learning_rate": 0.0002,
          "batch_size": 8,
          "epochs": 3
        }
      },
      "training": {
        "startedAt": "2025-07-03T12:05:00.000Z",
        "progress": 45.2,
        "currentEpoch": 2,
        "totalEpochs": 3
      }
    }
  ],
  "total": 5,
  "current_count": 2,
  "past_count": 3
}
```

#### POST `/api/jobs` - Create Job
**Description**: Create a new fine-tuning job.

```http
POST /api/jobs
Content-Type: application/json

{
  "name": "Test Fine-tuning Job",
  "description": "Test job for API validation",
  "tags": ["test", "api"],
  "configuration": {
    "model": {
      "uid": "test-model",
      "name": "Test Model"
    },
    "dataset": {
      "uid": "test-dataset",
      "name": "Test Dataset"
    },
    "hyperparameters": {
      "uid": "test-config",
      "learning_rate": 0.0002,
      "batch_size": 8,
      "epochs": 3
    }
  },
  "modelSaving": {
    "saveModel": true,
    "modelName": "test-fine-tuned-model"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Finetuning job created successfully",
  "jobUid": "job_1751559451590_15c0ef2a",
  "job": {
    "uid": "job_1751559451590_15c0ef2a",
    "name": "Test Fine-tuning Job",
    // ... complete job data
  }
}
```

#### GET `/api/jobs/{uid}` - Get Job by UID
**Description**: Retrieve a specific job by its UID.

```http
GET /api/jobs/job_1751559451590_15c0ef2a
```

**Response**:
```json
{
  "uid": "job_1751559451590_15c0ef2a",
  "name": "Test Fine-tuning Job",
  "status": "running",
  "live_metrics": {
    "current_loss": 0.3421,
    "validation_loss": 0.3876,
    "current_epoch": 2,
    "current_step": 150,
    "last_updated": "2025-07-03T12:45:00.000Z"
  },
  // ... complete job data
}
```

#### GET `/api/jobs/current` - Get Current Jobs
**Description**: Retrieve currently running or queued jobs.

```http
GET /api/jobs/current
```

#### GET `/api/jobs/past` - Get Past Jobs
**Description**: Retrieve completed or failed jobs.

```http
GET /api/jobs/past
```

#### GET `/api/jobs/statistics` - Get Job Statistics
**Description**: Get comprehensive job statistics.

```http
GET /api/jobs/statistics
```

**Response**:
```json
{
  "total": 10,
  "current": {
    "total": 3,
    "running": 2,
    "queued": 1,
    "created": 0
  },
  "past": {
    "total": 7,
    "completed": 5,
    "failed": 2
  },
  "success_rate": "71.4%",
  "last_updated": "2025-07-03T12:45:00.000Z"
}
```

---

### 📊 Metadata Management

#### GET `/api/metadata` - Get Metadata
**Description**: Get current workflow metadata.

```http
GET /api/metadata
```

**Response**:
```json
{
  "finetuningSession": {
    "id": "session_1750912194926",
    "createdAt": "2025-06-26T04:29:54.926Z",
    "lastModified": "2025-07-01T08:55:24.177Z",
    "status": "hyperparameters_configured"
  },
  "dataset": {
    "uid": "dataset_1751023766790_b0zqofldb",
    "name": "test_dataset",
    "selectedAt": "2025-07-01T08:55:24.177Z"
  },
  "model": {
    "uid": "1966449920",
    "baseModel": "stabilityai/stablelm-3b-4e1t",
    "modelName": "StableLM 3B 4E1T",
    "provider": "Stability AI"
  },
  "hyperparameters": {
    "uid": "010000rk00rl000500060001000a000g002s"
  }
}
```

---

## 📈 Training Monitor API

### Real-time Training Data

#### GET `/api/training/losses` - Get Training Losses
**Description**: Retrieve recent training loss data.

```http
GET /api/training/losses?last_n=20
```

**Parameters**:
- `last_n` (optional): Number of recent records (default: 20)

**Response**:
```json
[
  {
    "iteration": 145,
    "epoch": 2,
    "step": 150,
    "train_loss": 0.3421,
    "validation_loss": 0.3876,
    "learning_rate": 0.0002,
    "batch_size": 8
  }
]
```

#### GET `/api/training/losses/current` - Current Training Loss
**Description**: Get the current training loss data point.

```http
GET /api/training/losses/current
```

**Response**:
```json
{
  "iteration": 145,
  "epoch": 2,
  "step": 150,
  "train_loss": 0.3421,
  "validation_loss": 0.3876,
  "learning_rate": 0.0002,
  "batch_size": 8
}
```

#### GET `/api/training/resources` - Get Resource Metrics
**Description**: Retrieve system resource metrics.

```http
GET /api/training/resources?last_n=20
```

**Response**:
```json
[
  {
    "iteration": 145,
    "cpu_percent": 75.2,
    "ram_used_gb": 12.4,
    "ram_total_gb": 32.0,
    "gpu_percent": 89.1,
    "vram_used_gb": 18.2,
    "vram_total_gb": 24.0,
    "disk_used_gb": 245.8,
    "disk_total_gb": 1000.0,
    "gpu_temp": 72,
    "cpu_temp": 65,
    "network_in_mbps": 15.3,
    "network_out_mbps": 8.7
  }
]
```

#### GET `/api/training/resources/current` - Current Resources
**Description**: Get current system resource usage.

```http
GET /api/training/resources/current
```

#### GET `/api/training/status/{job_id}` - Training Status
**Description**: Get training status for a specific job.

```http
GET /api/training/status/job_1751559451590_15c0ef2a
```

**Response**:
```json
{
  "job_id": "job_1751559451590_15c0ef2a",
  "status": "running",
  "current_epoch": 2,
  "total_epochs": 3,
  "progress_percent": 65.4,
  "elapsed_time": "1h 23m 45s",
  "estimated_remaining": "~32m 15s",
  "current_step": 150,
  "total_steps": 230
}
```

#### GET `/api/training/summary` - Training Summary
**Description**: Get comprehensive training summary.

```http
GET /api/training/summary
```

**Response**:
```json
{
  "training_mode": "manual",
  "is_completed": false,
  "current_iteration": 145,
  "current_epoch": 2,
  "current_step": 150,
  "current_train_loss": 0.3421,
  "current_val_loss": 0.3876,
  "gpu_utilization": 89.1,
  "memory_usage": {
    "ram_used": 12.4,
    "ram_total": 32.0,
    "vram_used": 18.2,
    "vram_total": 24.0
  },
  "temperatures": {
    "gpu": 72,
    "cpu": 65
  },
  "elapsed_time": "1:23:45",
  "data_point": "145/230"
}
```

### Training Mode Management

#### GET `/api/training/mode` - Get Training Mode
**Description**: Get current training mode.

```http
GET /api/training/mode
```

**Response**:
```json
{
  "mode": "manual",
  "is_completed": false,
  "current_iteration": 145
}
```

#### POST `/api/training/mode/{mode}` - Set Training Mode
**Description**: Switch training mode between manual and automated.

```http
POST /api/training/mode/automated
```

**Parameters**:
- `mode`: Either "manual" or "automated"

**Response**:
```json
{
  "message": "Training mode set to automated",
  "mode": "automated",
  "reset": true
}
```

---

## 🔌 WebSocket Connections

### Real-time Training Data Stream

#### WebSocket `/ws/training/{job_id}`
**Description**: Real-time training data stream for live monitoring.

```javascript
const ws = new WebSocket('ws://127.0.0.1:8001/ws/training/job_123');

ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('Training update:', data);
};
```

**Message Format**:
```json
{
  "job_id": "job_123",
  "timestamp": "2025-07-03T12:45:00.000Z",
  "training_mode": "manual",
  "is_completed": false,
  "training": {
    "iteration": 145,
    "epoch": 2,
    "step": 150,
    "train_loss": 0.3421,
    "validation_loss": 0.3876,
    "learning_rate": 0.0002,
    "batch_size": 8
  },
  "resources": {
    "cpu_percent": 75.2,
    "gpu_percent": 89.1,
    "ram_used_gb": 12.4,
    "vram_used_gb": 18.2,
    "gpu_temp": 72
  },
  "iteration": 145,
  "total": 230
}
```

---

## ⚠️ Error Handling

### Standard Error Response Format

```json
{
  "detail": "Error message description",
  "status_code": 400,
  "error_type": "ValidationError"
}
```

### HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| 200 | OK | Successful requests |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 413 | Payload Too Large | File size exceeds limit |
| 422 | Unprocessable Entity | Validation failed |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

### Common Error Scenarios

#### Model Already Exists
```json
{
  "detail": "Model 'gpt2' already exists in your collection",
  "status_code": 409
}
```

#### CSV Validation Error
```json
{
  "detail": "Failed to parse CSV file: Missing required 'input' column",
  "status_code": 400
}
```

#### File Too Large
```json
{
  "detail": "File size exceeds maximum allowed size of 52428800 bytes",
  "status_code": 413
}
```

#### Training Data Not Available
```json
{
  "detail": "Training data not available",
  "status_code": 503
}
```

---

## 📊 Rate Limiting

### Current Limits (Development)
- **Search Requests**: No limit (development only)
- **File Uploads**: 50MB maximum file size
- **API Requests**: No rate limiting (implement in production)

### Production Recommendations
- **Search API**: 100 requests per minute per IP
- **File Uploads**: 10 uploads per hour per user
- **General API**: 1000 requests per hour per authenticated user

---

## 💡 Examples

### Complete Workflow Example

```python
import requests
import json

# 1. Upload and validate dataset
files = {'file': open('dataset.csv', 'rb')}
response = requests.post('http://127.0.0.1:8000/api/preview-csv', files=files)
dataset_preview = response.json()

# 2. Search for a model
response = requests.get('http://127.0.0.1:8000/api/models/search?query=gpt2&limit=5')
models = response.json()

# 3. Add model to collection
model_data = models[0]
response = requests.post('http://127.0.0.1:8000/api/models', json=model_data)

# 4. Create fine-tuning job
job_data = {
    "name": "My Fine-tuning Job",
    "description": "Test fine-tuning job",
    "configuration": {
        "model": {"uid": model_data["id"], "name": model_data["name"]},
        "dataset": {"uid": "test-dataset", "name": "Test Dataset"},
        "hyperparameters": {"uid": "config-123", "learning_rate": 0.0002}
    }
}
response = requests.post('http://127.0.0.1:8000/api/jobs', json=job_data)
job_result = response.json()

# 5. Monitor training progress
job_uid = job_result["jobUid"]
response = requests.get(f'http://127.0.0.1:8001/api/training/status/{job_uid}')
training_status = response.json()

print(f"Training Progress: {training_status['progress_percent']}%")
```

### JavaScript Frontend Example

```javascript
// Real-time training monitoring
class TrainingMonitor {
  constructor(jobId) {
    this.jobId = jobId;
    this.ws = new WebSocket(`ws://127.0.0.1:8001/ws/training/${jobId}`);
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.updateUI(data);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.fallbackToPolling();
    };
  }

  updateUI(data) {
    document.getElementById('current-loss').textContent = data.training.train_loss.toFixed(4);
    document.getElementById('gpu-usage').textContent = `${data.resources.gpu_percent.toFixed(1)}%`;
    document.getElementById('progress').style.width = `${(data.iteration / data.total) * 100}%`;
  }

  async fallbackToPolling() {
    setInterval(async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8001/api/training/summary`);
        const data = await response.json();
        this.updateUI({
          training: { train_loss: data.current_train_loss },
          resources: { gpu_percent: data.gpu_utilization },
          iteration: data.current_iteration,
          total: 230
        });
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000);
  }
}

// Initialize monitoring
const monitor = new TrainingMonitor('job_123');
```

---

## 🔗 Related Documentation

- [Workflow Guide](./WORKFLOW.md) - Complete fine-tuning workflow
- [Production Deployment](./PRODUCTION.md) - Production setup and scaling
- [OpenAPI Documentation](http://127.0.0.1:8000/docs) - Interactive API explorer
- [Training API Docs](http://127.0.0.1:8001/docs) - Training API documentation

---

## 📞 Support

For API-related questions or issues:
1. Check the interactive documentation at `/docs`
2. Review error responses for detailed information
3. Monitor server logs for debugging
4. Use the test scripts in `test-scripts/` for validation