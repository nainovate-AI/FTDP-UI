# AI Fine-tuning Dashboard - Production Deployment Guide

This guide covers production deployment, scaling, monitoring, and maintenance of the AI Fine-tuning Dashboard.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Infrastructure Requirements](#infrastructure-requirements)
- [Deployment Methods](#deployment-methods)
- [Environment Configuration](#environment-configuration)
- [Security Implementation](#security-implementation)
- [Monitoring & Logging](#monitoring--logging)
- [Performance Optimization](#performance-optimization)
- [Backup & Recovery](#backup--recovery)
- [Scaling Strategies](#scaling-strategies)
- [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

### Production Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │     Reverse     │    │   CDN/Static    │
│   (CloudFlare)  │────│   Proxy (Nginx) │────│   Assets        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
            ┌───────▼────────┐     ┌────────▼────────┐
            │   Frontend     │     │   Backend APIs  │
            │   (Next.js)    │     │   (FastAPI)     │
            │   Port: 3000   │     │   Ports: 8000   │
            └────────────────┘     │         8001    │
                                   └─────────────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
            ┌───────▼────────┐     ┌────────▼────────┐     ┌────────▼────────┐
            │   Database     │     │   File Storage  │     │   Model Store   │
            │   (PostgreSQL) │     │   (S3/MinIO)    │     │   (HuggingFace) │
            └────────────────┘     └─────────────────┘     └─────────────────┘
```

### Component Responsibilities

| Component | Purpose | Scaling | Dependencies |
|-----------|---------|---------|--------------|
| **Frontend** | User interface, dashboard | Horizontal | Backend APIs |
| **Main API** | Core functionality, CRUD | Horizontal | Database, Storage |
| **Training API** | Real-time metrics, monitoring | Vertical | Training infrastructure |
| **Database** | Persistent data storage | Read replicas | - |
| **File Storage** | Datasets, models, outputs | Distributed | - |

---

## 💾 Infrastructure Requirements

### Minimum Production Requirements

#### Frontend Servers
- **CPU**: 2 vCPUs
- **Memory**: 4GB RAM
- **Storage**: 20GB SSD
- **Network**: 1Gbps
- **OS**: Ubuntu 22.04 LTS / CentOS 8

#### Backend API Servers
- **CPU**: 4 vCPUs
- **Memory**: 8GB RAM
- **Storage**: 50GB SSD
- **Network**: 1Gbps
- **OS**: Ubuntu 22.04 LTS

#### Training Infrastructure
- **CPU**: 8+ vCPUs
- **Memory**: 32GB+ RAM
- **GPU**: NVIDIA RTX 4090 / A100 (for actual training)
- **Storage**: 500GB+ NVMe SSD
- **Network**: 10Gbps

#### Database Server
- **CPU**: 4 vCPUs
- **Memory**: 16GB RAM
- **Storage**: 200GB SSD (with backup)
- **Network**: 1Gbps

### Recommended Production Setup

#### Cloud Provider Specifications

**AWS Configuration**:
```yaml
Frontend:
  - Instance: t3.medium (2 vCPU, 4GB RAM)
  - Auto Scaling: 2-10 instances
  - Load Balancer: Application Load Balancer

Backend:
  - Instance: t3.large (2 vCPU, 8GB RAM)
  - Auto Scaling: 2-6 instances
  - Load Balancer: Application Load Balancer

Training:
  - Instance: p3.2xlarge (8 vCPU, 61GB RAM, 1x V100)
  - Auto Scaling: On-demand

Database:
  - Service: RDS PostgreSQL
  - Instance: db.t3.large
  - Multi-AZ: Enabled
  - Backup: 7-day retention

Storage:
  - Service: S3
  - Backup: Cross-region replication
```

**Google Cloud Configuration**:
```yaml
Frontend:
  - Instance: e2-standard-2
  - Auto Scaling: 2-10 instances
  - Load Balancer: Cloud Load Balancing

Backend:
  - Instance: e2-standard-4
  - Auto Scaling: 2-6 instances

Training:
  - Instance: n1-standard-8 + 1x Tesla V100
  - Preemptible: For cost optimization

Database:
  - Service: Cloud SQL PostgreSQL
  - Instance: db-standard-4
  - High Availability: Enabled

Storage:
  - Service: Cloud Storage
  - Multi-regional: Enabled
```

---

## 🚀 Deployment Methods

### Method 1: Docker Deployment

#### Docker Compose Production Setup

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.yourdomain.com
    ports:
      - "3000:3000"
    restart: unless-stopped
    depends_on:
      - backend-main
      - backend-training

  backend-main:
    build:
      context: ./python-backend
      dockerfile: Dockerfile.main
    environment:
      - ENVIRONMENT=production
      - DATABASE_URL=postgresql://user:pass@db:5432/ftdp
      - REDIS_URL=redis://redis:6379
      - S3_BUCKET=ftdp-production
    ports:
      - "8000:8000"
    restart: unless-stopped
    depends_on:
      - db
      - redis

  backend-training:
    build:
      context: ./python-backend
      dockerfile: Dockerfile.training
    environment:
      - ENVIRONMENT=production
      - REDIS_URL=redis://redis:6379
    ports:
      - "8001:8001"
    restart: unless-stopped
    depends_on:
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=ftdp
      - POSTGRES_USER=ftdp_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    restart: unless-stopped
    depends_on:
      - frontend

volumes:
  postgres_data:
  redis_data:
```

#### Dockerfiles

**Frontend Dockerfile**:
```dockerfile
# Dockerfile.frontend
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production && npm cache clean --force

# Build application
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

**Backend Main Dockerfile**:
```dockerfile
# Dockerfile.main
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
RUN chown -R app:app /app
USER app

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Method 2: Kubernetes Deployment

#### Kubernetes Manifests

```yaml
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  labels:
    app: ftdp-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ftdp-frontend
  template:
    metadata:
      labels:
        app: ftdp-frontend
    spec:
      containers:
      - name: frontend
        image: ftdp/frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: NEXT_PUBLIC_API_URL
          value: "https://api.yourdomain.com"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 60
          periodSeconds: 30

---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  selector:
    app: ftdp-frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

### Method 3: Cloud-Native Deployment

#### AWS ECS with Fargate

```json
{
  "family": "ftdp-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "backend-main",
      "image": "your-registry/ftdp-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "ENVIRONMENT",
          "value": "production"
        },
        {
          "name": "DATABASE_URL",
          "value": "postgresql://user:pass@rds-endpoint:5432/ftdp"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/ftdp-backend",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8000/api/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

---

## ⚙️ Environment Configuration

### Environment Variables

#### Frontend (.env.production)
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_TRAINING_API_URL=https://training.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://training.yourdomain.com
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
NEXT_PUBLIC_ANALYTICS_ID=GA_TRACKING_ID
```

#### Backend Main API (.env.production)
```bash
ENVIRONMENT=production
DEBUG=false

# Database
DATABASE_URL=postgresql://user:password@host:5432/ftdp_prod
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=0

# Redis
REDIS_URL=redis://redis-host:6379/0
REDIS_POOL_SIZE=10

# Storage
S3_BUCKET=ftdp-production
S3_REGION=us-west-2
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key

# Security
SECRET_KEY=your-super-secret-key-here
JWT_SECRET=your-jwt-secret-here
ALLOWED_HOSTS=api.yourdomain.com,yourdomain.com

# External APIs
HUGGINGFACE_API_TOKEN=your-hf-token
OPENAI_API_KEY=your-openai-key

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=INFO

# Rate Limiting
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_BURST=20

# File Upload
MAX_FILE_SIZE=100MB
UPLOAD_PATH=/app/uploads
```

#### Backend Training API (.env.production)
```bash
ENVIRONMENT=production
DEBUG=false

# Redis
REDIS_URL=redis://redis-host:6379/1

# Training Infrastructure
TRAINING_WORKER_COUNT=4
GPU_MEMORY_LIMIT=20GB
MODEL_CACHE_DIR=/app/models

# Monitoring
METRICS_RETENTION_DAYS=30
WEBSOCKET_MAX_CONNECTIONS=1000

# Security
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

### Configuration Management

#### Using Kubernetes ConfigMaps
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  DATABASE_HOST: "postgres-service"
  REDIS_HOST: "redis-service"
  LOG_LEVEL: "INFO"
  ENVIRONMENT: "production"
```

#### Using AWS Parameter Store
```python
import boto3

def get_parameter(name, decrypt=True):
    ssm = boto3.client('ssm')
    response = ssm.get_parameter(Name=name, WithDecryption=decrypt)
    return response['Parameter']['Value']

# Usage in application
DATABASE_URL = get_parameter('/ftdp/prod/database-url')
SECRET_KEY = get_parameter('/ftdp/prod/secret-key')
```

---

## 🔐 Security Implementation

### Authentication & Authorization

#### JWT Authentication Setup
```python
# auth.py
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from datetime import datetime, timedelta

security = HTTPBearer()

def create_token(user_id: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=24),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("user_id")
        role = payload.get("role")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"user_id": user_id, "role": role}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

#### Role-Based Access Control
```python
from enum import Enum
from functools import wraps

class UserRole(Enum):
    ADMIN = "admin"
    USER = "user"
    VIEWER = "viewer"

def require_role(required_role: UserRole):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            current_user = kwargs.get('current_user')
            if not current_user or current_user['role'] != required_role.value:
                raise HTTPException(status_code=403, detail="Insufficient privileges")
            return await func(*args, **kwargs)
        return wrapper
    return decorator

# Usage
@app.post("/api/admin/users")
@require_role(UserRole.ADMIN)
async def create_user(user_data: dict, current_user: dict = Depends(get_current_user)):
    # Admin-only endpoint
    pass
```

### HTTPS and SSL Configuration

#### Nginx SSL Configuration
```nginx
# nginx.conf
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Frontend
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API
    location /api/ {
        proxy_pass http://backend-main:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://backend-training:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Database Security

#### PostgreSQL Security Configuration
```sql
-- Create dedicated database user
CREATE USER ftdp_app WITH ENCRYPTED PASSWORD 'secure_password';

-- Create database
CREATE DATABASE ftdp_prod OWNER ftdp_app;

-- Grant necessary permissions only
GRANT CONNECT ON DATABASE ftdp_prod TO ftdp_app;
GRANT USAGE ON SCHEMA public TO ftdp_app;
GRANT CREATE ON SCHEMA public TO ftdp_app;

-- Enable row level security
ALTER DATABASE ftdp_prod SET row_security = on;

-- Connection security
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/etc/ssl/certs/server.crt';
ALTER SYSTEM SET ssl_key_file = '/etc/ssl/private/server.key';
```

### Input Validation & Sanitization

#### Pydantic Model Validation
```python
from pydantic import BaseModel, validator, Field
from typing import List, Optional
import re

class DatasetUpload(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    tags: List[str] = Field(default_factory=list, max_items=10)
    
    @validator('name')
    def validate_name(cls, v):
        if not re.match(r'^[a-zA-Z0-9\s\-_]+$', v):
            raise ValueError('Name contains invalid characters')
        return v.strip()
    
    @validator('tags')
    def validate_tags(cls, v):
        for tag in v:
            if not re.match(r'^[a-zA-Z0-9\-_]+$', tag):
                raise ValueError(f'Invalid tag: {tag}')
        return v

class JobConfiguration(BaseModel):
    learning_rate: float = Field(..., gt=0, le=1)
    batch_size: int = Field(..., ge=1, le=128)
    epochs: int = Field(..., ge=1, le=100)
    
    @validator('learning_rate')
    def validate_learning_rate(cls, v):
        if v < 1e-6 or v > 1e-1:
            raise ValueError('Learning rate must be between 1e-6 and 1e-1')
        return v
```

---

## 📊 Monitoring & Logging

### Application Monitoring

#### Health Check Endpoints
```python
from fastapi import FastAPI, status
from sqlalchemy import text
import redis
import time

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """Comprehensive health check"""
    health_status = {
        "status": "healthy",
        "timestamp": time.time(),
        "checks": {}
    }
    
    # Database check
    try:
        result = await database.fetch_one(text("SELECT 1"))
        health_status["checks"]["database"] = "healthy"
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["checks"]["database"] = f"error: {str(e)}"
    
    # Redis check
    try:
        redis_client.ping()
        health_status["checks"]["redis"] = "healthy"
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["checks"]["redis"] = f"error: {str(e)}"
    
    # Storage check
    try:
        # Test S3 connectivity
        s3_client.head_bucket(Bucket=S3_BUCKET)
        health_status["checks"]["storage"] = "healthy"
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["checks"]["storage"] = f"error: {str(e)}"
    
    if health_status["status"] != "healthy":
        raise HTTPException(status_code=503, detail=health_status)
    
    return health_status

@app.get("/health/live")
async def liveness_check():
    """Simple liveness check for Kubernetes"""
    return {"status": "alive"}

@app.get("/health/ready")
async def readiness_check():
    """Readiness check for Kubernetes"""
    # Check if all dependencies are ready
    return await health_check()
```

#### Metrics Collection with Prometheus
```python
from prometheus_client import Counter, Histogram, Gauge, generate_latest
from fastapi import Request
import time

# Metrics
REQUEST_COUNT = Counter('requests_total', 'Total requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('request_duration_seconds', 'Request duration')
ACTIVE_CONNECTIONS = Gauge('active_connections', 'Active connections')
TRAINING_JOBS = Gauge('training_jobs_active', 'Active training jobs')

@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    duration = time.time() - start_time
    REQUEST_DURATION.observe(duration)
    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()
    
    return response

@app.get("/metrics")
async def get_metrics():
    return Response(generate_latest(), media_type="text/plain")
```

### Logging Configuration

#### Structured Logging Setup
```python
import logging
import json
from datetime import datetime
from pythonjsonlogger import jsonlogger

class CustomJSONFormatter(jsonlogger.JsonFormatter):
    def add_fields(self, log_record, record, message_dict):
        super().add_fields(log_record, record, message_dict)
        log_record['timestamp'] = datetime.utcnow().isoformat()
        log_record['level'] = record.levelname
        log_record['service'] = 'ftdp-backend'
        log_record['version'] = '1.0.5'

def setup_logging():
    logger = logging.getLogger()
    handler = logging.StreamHandler()
    
    if ENVIRONMENT == 'production':
        formatter = CustomJSONFormatter(
            '%(timestamp)s %(level)s %(name)s %(message)s'
        )
    else:
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(getattr(logging, LOG_LEVEL))
    
    return logger

# Usage
logger = setup_logging()
logger.info("Application started", extra={
    "user_id": "123",
    "action": "login",
    "ip_address": "192.168.1.1"
})
```

#### ELK Stack Integration
```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:8.8.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5044:5044"
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.8.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

volumes:
  elasticsearch_data:
```

### Monitoring Dashboards

#### Grafana Dashboard Configuration
```json
{
  "dashboard": {
    "title": "FTDP Production Dashboard",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(requests_total{status=~\"4..|5..\"}[5m]) / rate(requests_total[5m])",
            "legendFormat": "Error rate"
          }
        ]
      },
      {
        "title": "Active Training Jobs",
        "type": "singlestat",
        "targets": [
          {
            "expr": "training_jobs_active",
            "legendFormat": "Active jobs"
          }
        ]
      }
    ]
  }
}
```

---

## ⚡ Performance Optimization

### Database Optimization

#### Connection Pooling
```python
from sqlalchemy.pool import QueuePool
from sqlalchemy import create_engine

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=0,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False
)
```

#### Database Indexes
```sql
-- Performance indexes
CREATE INDEX CONCURRENTLY idx_jobs_status ON jobs(status);
CREATE INDEX CONCURRENTLY idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX CONCURRENTLY idx_jobs_user_id ON jobs(user_id);
CREATE INDEX CONCURRENTLY idx_datasets_user_id ON datasets(user_id);
CREATE INDEX CONCURRENTLY idx_models_provider ON models(provider);

-- Composite indexes
CREATE INDEX CONCURRENTLY idx_jobs_user_status ON jobs(user_id, status);
CREATE INDEX CONCURRENTLY idx_training_metrics_job_timestamp ON training_metrics(job_id, timestamp DESC);
```

#### Query Optimization
```python
from sqlalchemy.orm import selectinload, joinedload

# Eager loading to avoid N+1 queries
async def get_jobs_with_config(user_id: str):
    query = (
        select(Job)
        .options(
            selectinload(Job.model),
            selectinload(Job.dataset),
            joinedload(Job.hyperparameters)
        )
        .where(Job.user_id == user_id)
    )
    result = await database.execute(query)
    return result.scalars().all()
```

### Caching Strategy

#### Redis Caching Implementation
```python
import redis
import json
from functools import wraps
import hashlib

redis_client = redis.Redis.from_url(REDIS_URL)

def cache_result(expiry=3600):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = f"{func.__name__}:{hashlib.md5(str(args + tuple(kwargs.items())).encode()).hexdigest()}"
            
            # Try to get from cache
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            redis_client.setex(cache_key, expiry, json.dumps(result, default=str))
            
            return result
        return wrapper
    return decorator

# Usage
@cache_result(expiry=1800)  # 30 minutes
async def get_popular_models():
    # Expensive database query
    return await fetch_models_with_stats()
```

#### CDN Configuration
```javascript
// next.config.js
module.exports = {
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://cdn.yourdomain.com' : '',
  images: {
    domains: ['cdn.yourdomain.com'],
    loader: 'cloudinary',
    path: 'https://res.cloudinary.com/your-cloud-name/image/fetch/',
  },
  experimental: {
    outputStandalone: true,
  }
}
```

### Frontend Optimization

#### Code Splitting and Lazy Loading
```tsx
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Lazy load heavy components
const TrainingDashboard = dynamic(() => import('./TrainingDashboard'), {
  loading: () => <div>Loading training dashboard...</div>,
  ssr: false
})

const ModelSelection = dynamic(() => import('./ModelSelection'), {
  loading: () => <div>Loading models...</div>
})

// Route-based code splitting
export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Router>
        <Routes>
          <Route path="/training" element={<TrainingDashboard />} />
          <Route path="/models" element={<ModelSelection />} />
        </Routes>
      </Router>
    </Suspense>
  )
}
```

#### Bundle Optimization
```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true,
        }
      },
    },
  },
  resolve: {
    alias: {
      'react': 'preact/compat',
      'react-dom': 'preact/compat'
    }
  }
}
```

---

## 💾 Backup & Recovery

### Database Backup Strategy

#### Automated PostgreSQL Backups
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/postgres"
DB_NAME="ftdp_prod"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/ftdp_backup_$DATE.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Upload to S3
aws s3 cp "$BACKUP_FILE.gz" s3://ftdp-backups/postgres/

# Cleanup old local backups (keep 7 days)
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

# Cleanup old S3 backups (keep 30 days)
aws s3 ls s3://ftdp-backups/postgres/ | awk '{print $4}' | \
  head -n -30 | xargs -I {} aws s3 rm s3://ftdp-backups/postgres/{}
```

#### Point-in-Time Recovery Setup
```sql
-- Enable WAL archiving
ALTER SYSTEM SET wal_level = replica;
ALTER SYSTEM SET archive_mode = on;
ALTER SYSTEM SET archive_command = 'aws s3 cp %p s3://ftdp-wal-archive/%f';
ALTER SYSTEM SET max_wal_senders = 3;
ALTER SYSTEM SET wal_keep_segments = 32;

-- Restart required
SELECT pg_reload_conf();
```

### File Storage Backup

#### S3 Cross-Region Replication
```json
{
  "Role": "arn:aws:iam::account:role/replication-role",
  "Rules": [
    {
      "ID": "ftdp-replication",
      "Status": "Enabled",
      "Filter": {
        "Prefix": ""
      },
      "Destination": {
        "Bucket": "arn:aws:s3:::ftdp-backup-us-east-1",
        "StorageClass": "STANDARD_IA"
      }
    }
  ]
}
```

### Disaster Recovery Plan

#### Recovery Time Objectives (RTO)
- **Database Recovery**: 15 minutes
- **Application Recovery**: 30 minutes
- **Full System Recovery**: 2 hours

#### Recovery Point Objectives (RPO)
- **Database**: 1 hour (continuous WAL archiving)
- **File Storage**: 15 minutes (cross-region replication)
- **Configuration**: Real-time (Infrastructure as Code)

#### Recovery Procedures
```bash
#!/bin/bash
# disaster-recovery.sh

# 1. Restore Database
LATEST_BACKUP=$(aws s3 ls s3://ftdp-backups/postgres/ | sort | tail -n 1 | awk '{print $4}')
aws s3 cp s3://ftdp-backups/postgres/$LATEST_BACKUP /tmp/
gunzip /tmp/$LATEST_BACKUP
psql -h $NEW_DB_HOST -U postgres -c "CREATE DATABASE ftdp_prod;"
psql -h $NEW_DB_HOST -U postgres -d ftdp_prod -f /tmp/${LATEST_BACKUP%.gz}

# 2. Update DNS
aws route53 change-resource-record-sets --hosted-zone-id $HOSTED_ZONE_ID --change-batch '{
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "api.yourdomain.com",
      "Type": "A",
      "AliasTarget": {
        "DNSName": "'$NEW_LOAD_BALANCER_DNS'",
        "EvaluateTargetHealth": false,
        "HostedZoneId": "'$NEW_LOAD_BALANCER_ZONE_ID'"
      }
    }
  }]
}'

# 3. Deploy Application
kubectl apply -f k8s/
kubectl rollout restart deployment/frontend
kubectl rollout restart deployment/backend-main
kubectl rollout restart deployment/backend-training
```

---

## 📈 Scaling Strategies

### Horizontal Scaling

#### Auto Scaling Configuration
```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: frontend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: frontend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
```

#### Load Balancer Configuration
```yaml
# AWS ALB Ingress
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ftdp-ingress
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/ssl-redirect: '443'
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:region:account:certificate/cert-id
    alb.ingress.kubernetes.io/load-balancer-attributes: >
      idle_timeout.timeout_seconds=60,
      routing.http2.enabled=true,
      access_logs.s3.enabled=true,
      access_logs.s3.bucket=ftdp-access-logs
spec:
  rules:
  - host: yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
  - host: api.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend-main-service
            port:
              number: 8000
```

### Database Scaling

#### Read Replicas Setup
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import random

# Master database (write operations)
master_engine = create_engine(MASTER_DATABASE_URL)
MasterSession = sessionmaker(bind=master_engine)

# Read replicas (read operations)
replica_engines = [
    create_engine(REPLICA_1_DATABASE_URL),
    create_engine(REPLICA_2_DATABASE_URL),
]
ReplicaSessions = [sessionmaker(bind=engine) for engine in replica_engines]

def get_read_session():
    """Get a session from a random read replica"""
    session_class = random.choice(ReplicaSessions)
    return session_class()

def get_write_session():
    """Get a session for write operations"""
    return MasterSession()

# Usage
async def get_jobs(user_id: str):
    # Use read replica for queries
    with get_read_session() as session:
        return session.query(Job).filter(Job.user_id == user_id).all()

async def create_job(job_data: dict):
    # Use master for writes
    with get_write_session() as session:
        job = Job(**job_data)
        session.add(job)
        session.commit()
        return job
```

#### Database Sharding Strategy
```python
def get_shard_key(user_id: str) -> str:
    """Determine which shard to use based on user ID"""
    shard_number = hash(user_id) % NUM_SHARDS
    return f"shard_{shard_number}"

def get_database_url(shard_key: str) -> str:
    """Get database URL for specific shard"""
    shard_mapping = {
        "shard_0": DATABASE_SHARD_0_URL,
        "shard_1": DATABASE_SHARD_1_URL,
        "shard_2": DATABASE_SHARD_2_URL,
    }
    return shard_mapping[shard_key]

class ShardedDatabase:
    def __init__(self):
        self.engines = {}
        for i in range(NUM_SHARDS):
            shard_key = f"shard_{i}"
            self.engines[shard_key] = create_engine(get_database_url(shard_key))
    
    def get_session(self, user_id: str):
        shard_key = get_shard_key(user_id)
        engine = self.engines[shard_key]
        return sessionmaker(bind=engine)()
```

---

## 🔧 Troubleshooting

### Common Production Issues

#### High Memory Usage
```bash
# Monitor memory usage
kubectl top nodes
kubectl top pods

# Check for memory leaks
kubectl exec -it backend-pod -- python -c "
import psutil
import gc
print(f'Memory usage: {psutil.virtual_memory().percent}%')
print(f'Objects in garbage collector: {len(gc.get_objects())}')
"

# Scale down if needed
kubectl scale deployment backend-main --replicas=2
```

#### Database Connection Issues
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

-- Check long-running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';

-- Kill long-running queries
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '10 minutes';
```

#### Training Job Failures
```python
# Monitor training job health
async def check_training_health():
    unhealthy_jobs = []
    
    for job in active_training_jobs:
        try:
            # Check if training process is responsive
            response = await training_client.get_status(job.id)
            if response.status_code != 200:
                unhealthy_jobs.append(job.id)
        except Exception as e:
            logger.error(f"Health check failed for job {job.id}: {e}")
            unhealthy_jobs.append(job.id)
    
    # Restart unhealthy jobs
    for job_id in unhealthy_jobs:
        await restart_training_job(job_id)
```

### Log Analysis

#### Error Pattern Detection
```bash
# Find most common errors
kubectl logs deployment/backend-main --tail=10000 | \
  grep ERROR | \
  awk '{print $NF}' | \
  sort | uniq -c | sort -nr | head -10

# Monitor real-time errors
kubectl logs deployment/backend-main -f | \
  grep --line-buffered ERROR | \
  while read line; do
    echo "$(date): $line" | tee -a /var/log/ftdp-errors.log
  done
```

#### Performance Analysis
```bash
# Analyze response times
kubectl logs deployment/backend-main --tail=10000 | \
  grep "duration:" | \
  awk '{print $NF}' | \
  sort -n | \
  awk '
    {
      times[NR] = $1
      sum += $1
    }
    END {
      printf "Count: %d\n", NR
      printf "Average: %.3f\n", sum/NR
      printf "Median: %.3f\n", times[int(NR/2)]
      printf "95th percentile: %.3f\n", times[int(NR*0.95)]
    }
  '
```

### Emergency Procedures

#### Service Restart Procedure
```bash
#!/bin/bash
# emergency-restart.sh

echo "Starting emergency restart procedure..."

# 1. Check service health
kubectl get pods -l app=ftdp

# 2. Graceful restart with rolling update
kubectl rollout restart deployment/frontend
kubectl rollout restart deployment/backend-main
kubectl rollout restart deployment/backend-training

# 3. Wait for rollout completion
kubectl rollout status deployment/frontend --timeout=300s
kubectl rollout status deployment/backend-main --timeout=300s
kubectl rollout status deployment/backend-training --timeout=300s

# 4. Verify health
sleep 30
kubectl get pods -l app=ftdp
curl -f http://api.yourdomain.com/api/health || echo "Health check failed"

echo "Emergency restart completed"
```

#### Database Recovery
```bash
#!/bin/bash
# db-recovery.sh

# 1. Stop all application connections
kubectl scale deployment backend-main --replicas=0

# 2. Create database backup before recovery
pg_dump -h $DB_HOST -U $DB_USER -d ftdp_prod > /tmp/pre_recovery_backup.sql

# 3. Restore from latest backup
LATEST_BACKUP=$(aws s3 ls s3://ftdp-backups/postgres/ | sort | tail -n 1 | awk '{print $4}')
aws s3 cp s3://ftdp-backups/postgres/$LATEST_BACKUP /tmp/
gunzip /tmp/$LATEST_BACKUP
psql -h $DB_HOST -U $DB_USER -d ftdp_prod -f /tmp/${LATEST_BACKUP%.gz}

# 4. Restart applications
kubectl scale deployment backend-main --replicas=3

# 5. Verify recovery
sleep 60
curl -f http://api.yourdomain.com/api/health
```

---

## 📞 Support & Maintenance

### Monitoring Checklist

#### Daily Monitoring
- [ ] Check application health endpoints
- [ ] Review error logs and rates
- [ ] Monitor response times and throughput
- [ ] Check database performance metrics
- [ ] Verify backup completion
- [ ] Review training job success rates

#### Weekly Monitoring
- [ ] Analyze performance trends
- [ ] Review capacity utilization
- [ ] Check security logs for anomalies
- [ ] Update dependencies and security patches
- [ ] Test disaster recovery procedures
- [ ] Review and rotate logs

#### Monthly Monitoring
- [ ] Capacity planning review
- [ ] Security audit and penetration testing
- [ ] Performance optimization assessment
- [ ] Cost optimization review
- [ ] Documentation updates
- [ ] Team training and knowledge sharing

### Maintenance Windows

#### Scheduled Maintenance Procedure
```bash
#!/bin/bash
# maintenance.sh

echo "Starting scheduled maintenance window..."

# 1. Enable maintenance mode
kubectl apply -f maintenance-mode.yaml

# 2. Wait for traffic to drain
sleep 60

# 3. Perform updates
kubectl set image deployment/backend-main backend=ftdp/backend:v1.0.6
kubectl set image deployment/frontend frontend=ftdp/frontend:v1.0.6

# 4. Wait for deployment
kubectl rollout status deployment/backend-main --timeout=600s
kubectl rollout status deployment/frontend --timeout=600s

# 5. Run database migrations
kubectl exec deployment/backend-main -- python manage.py migrate

# 6. Disable maintenance mode
kubectl delete -f maintenance-mode.yaml

# 7. Verify system health
./health-check.sh

echo "Maintenance window completed"
```

This production guide provides comprehensive coverage of deploying, securing, monitoring, and maintaining the AI Fine-tuning Dashboard in production environments. Adapt the configurations to your specific infrastructure and requirements.