# Test Scripts for AI Fine-tuning Dashboard

This directory contains comprehensive test scripts to validate the functionality of the AI Fine-tuning Dashboard. These scripts help ensure all components are working correctly and provide utilities for development and troubleshooting.

## 📋 Available Test Scripts

### 1. **Quick Start Script** (`quick_start.py`)
**Purpose**: Quickly check if all services are running and provide startup guidance.

```bash
python test-scripts/quick_start.py
```

**Features**:
- ✅ Checks status of all services (Frontend, Main API, Training API)
- 🔧 Provides startup commands for missing services
- 🌐 Lists useful URLs for development
- 📊 Shows available test commands

---

### 2. **API Health Check** (`test_api_health.py`)
**Purpose**: Comprehensive health check of all API endpoints.

```bash
python test-scripts/test_api_health.py
```

**What it tests**:
- ✅ Main API endpoints (models, datasets, jobs, metadata)
- ✅ Training API endpoints (losses, resources, status)
- ✅ Data integrity and relationships
- ✅ Frontend connectivity
- 📊 Generates detailed test report

---

### 3. **Data Operations Test** (`test_data_operations.py`)
**Purpose**: Tests CRUD operations for models, datasets, and jobs.

```bash
python test-scripts/test_data_operations.py
```

**What it tests**:
- 🔍 Model search and management
- 📁 Dataset upload and CSV preview
- 💼 Job creation and management
- 📊 Metadata operations
- 🔧 Error handling and validation

---

### 4. **Training Simulation Test** (`test_training_simulation.py`)
**Purpose**: Tests the training monitoring and real-time data functionality.

```bash
python test-scripts/test_training_simulation.py
```

**What it tests**:
- 📈 Training data availability and format
- ⏱️ Real-time data endpoints
- 🏃 Training status and progress
- 🔄 Training mode switching (manual/automated)
- 📊 Data consistency across endpoints
- 🔄 Real-time progression detection

---

### 5. **End-to-End Workflow Test** (`test_e2e_workflow.py`)
**Purpose**: Complete workflow test from dataset upload to job monitoring.

```bash
python test-scripts/test_e2e_workflow.py
```

**What it tests**:
1. 📁 **Dataset Upload & Validation** - Upload CSV and validate format
2. 🤖 **Model Selection** - Search and select models from HuggingFace
3. ⚙️ **Hyperparameter Configuration** - Configure training parameters
4. 💼 **Job Creation** - Create and verify fine-tuning jobs
5. 📊 **Training Monitoring** - Monitor live training progress
6. 🔧 **Job Management** - Test job management features

---

## 🚀 Startup Scripts

### Windows PowerShell (`start-services.ps1`)
```powershell
.\test-scripts\start-services.ps1
```

**Options**:
- `-SkipFrontend` - Don't start the Next.js frontend
- `-SkipTests` - Skip initial health checks
- `-Help` - Show help information

### Linux/Mac Bash (`start-services.sh`)
```bash
chmod +x test-scripts/start-services.sh
./test-scripts/start-services.sh
```

**Options**:
- `--skip-frontend` - Don't start the Next.js frontend
- `--skip-tests` - Skip initial health checks
- `--help` - Show help information

---

## 🔧 Prerequisites

### Python Dependencies
```bash
pip install requests pandas
```

### Services Required
1. **Main Backend API** (Port 8000)
   ```bash
   cd python-backend
   uv run python main.py
   ```

2. **Training Monitor API** (Port 8001)
   ```bash
   cd python-backend
   uv run python mock_training_api.py
   ```

3. **Frontend Dashboard** (Port 3000)
   ```bash
   npm run dev
   ```

---

## 📊 Test Results and Interpretation

### Success Indicators
- ✅ **All Green Checkmarks**: Service is working correctly
- 📊 **Detailed Metrics**: APIs returning expected data formats
- 🔄 **Real-time Updates**: Training simulation progressing correctly

### Warning Indicators
- ⚠️ **Yellow Warnings**: Service accessible but with minor issues
- 🔄 **Partial Functionality**: Some features working, others need attention

### Error Indicators
- ❌ **Red Errors**: Service not accessible or major functionality broken
- 🚫 **Connection Failed**: Service not running or port blocked

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **Service Not Running**
```
[ERROR] Connection refused (service not running)
```
**Solution**: Start the required service:
```bash
# Main API
cd python-backend && uv run python main.py

# Training API
cd python-backend && uv run python mock_training_api.py

# Frontend
npm run dev
```

#### 2. **Port Already in Use**
```
[WARNING] Port 8000 is already in use
```
**Solution**: 
- Stop existing processes using the port
- Or use different ports in configuration

#### 3. **Module Import Errors**
```
ModuleNotFoundError: No module named 'requests'
```
**Solution**: Install required dependencies:
```bash
pip install requests pandas
```

#### 4. **CSV Data Not Found**
```
[ERROR] Training data not available
```
**Solution**: Ensure CSV files exist in `python-backend/`:
- `training_metrics_manual.csv`
- `training_metrics_automated.csv`
- `resource_metrics_manual.csv`
- `resource_metrics_automated.csv`

---

## 📈 Performance Testing

### Load Testing
For production deployment, consider testing with:
- Multiple concurrent users
- Large dataset uploads
- Extended training simulations
- WebSocket connection stability

### Monitoring
Monitor these metrics during testing:
- **Response Times**: API endpoint latency
- **Memory Usage**: Backend service resource consumption
- **Data Consistency**: Real-time data accuracy
- **Error Rates**: Failed requests percentage

---

## 🔄 Continuous Integration

### Automated Testing
These scripts can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Test API Health
  run: python test-scripts/test_api_health.py

- name: Test Data Operations
  run: python test-scripts/test_data_operations.py

- name: Test Training Simulation
  run: python test-scripts/test_training_simulation.py
```

### Test Coverage
- **Unit Tests**: Individual component functionality
- **Integration Tests**: Service-to-service communication
- **End-to-End Tests**: Complete user workflows
- **Performance Tests**: Load and stress testing

---

## 📝 Test Report Generation

### HTML Reports
Consider extending scripts to generate HTML test reports:
```python
# Example: Generate HTML test report
import json
from datetime import datetime

def generate_html_report(test_results):
    # Implementation for HTML report generation
    pass
```

### Metrics Collection
Track these metrics across test runs:
- **Success Rate**: Percentage of passing tests
- **Response Times**: API endpoint performance
- **Error Patterns**: Common failure modes
- **Regression Detection**: Performance degradation

---

## 🎯 Next Steps

After running all tests successfully:

1. **🌐 Access Dashboard**: Open http://localhost:3000
2. **📁 Upload Dataset**: Test with your own CSV files
3. **🤖 Select Models**: Browse and add models from HuggingFace
4. **🔧 Configure Training**: Set up hyperparameters
5. **🚀 Start Fine-tuning**: Create and monitor jobs
6. **📊 Monitor Progress**: Watch real-time training metrics

---

## 🆘 Support

If tests fail or you encounter issues:

1. **Check Logs**: Review service logs for detailed errors
2. **Verify Ports**: Ensure ports 3000, 8000, 8001 are available
3. **Dependencies**: Confirm all packages are installed
4. **File Permissions**: Ensure scripts have execute permissions
5. **Network**: Check firewall and network connectivity

For additional support, review the main project documentation or create an issue with test results and error logs.
