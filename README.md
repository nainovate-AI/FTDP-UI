# AI Fine-tuning Dashboard

A modern, React-based dashboard for managing AI model fine-tuning workflows with real-time monitoring, comprehensive job management, and award-winning UI design inspired by Linear and Vercel.

## Description

This application provides a comprehensive platform for AI practitioners to manage their complete fine-tuning workflows. Features include real-time job monitoring, live metrics visualization, comprehensive dashboard management, and seamless integration between job creation and monitoring.

## Scope & Progress

- ✅ **Dataset Management** - Upload, validate, and preview CSV datasets
- ✅ **Model Selection** - Browse and search HuggingFace models with real-time integration  
- ✅ **Backend Integration** - Python FastAPI backend with comprehensive API coverage
- ✅ **Live Job Monitoring** - Real-time training metrics and resource monitoring
- ✅ **Dashboard Management** - Functional job cards with comprehensive statistics
- ✅ **Job Management** - Complete lifecycle from creation to completion
- 🔄 **Configuration Setup** - Training parameters and configuration (Enhanced)
- 🔄 **Training Execution** - Backend training integration (In Progress)
- 🔄 **Deployment** - Model deployment and serving (Planned)

## New Features: Live Job Screen & Dashboard

### 🎯 **Redesigned Live Job Screen**
- **Clean, Modular Layout**: Inspired by Linear and Vercel design principles
- **Real-time Metrics**: Live training loss, resource usage, and system monitoring
- **Vertical Stage Tracker**: Visual pipeline progress with real-time status updates
- **Universal Job Support**: Works for running, completed, failed, and pending jobs
- **Collapsible Logs Panel**: Live log streaming with professional terminal interface
- **Responsive Design**: Seamless experience across all devices

### 📊 **Enhanced Dashboard**
- **Functional Job Cards**: All cards now link to live metrics screens
- **Comprehensive Statistics**: Real-time overview of training job performance
- **Search & Filter**: Advanced job management with multiple filter options
- **Status Indicators**: Clear visual status for all job types
- **Performance Metrics**: Success rates, completion statistics, and trends

### 🔗 **Seamless Integration**
- **Job Lifecycle Management**: From creation to completion tracking
- **API Integration**: Comprehensive backend support for all operations
- **Real-time Updates**: Live data polling with graceful error handling
- **Mock Data Support**: Realistic visualizations for completed jobs

See [LIVE_JOB_SCREEN.md](./LIVE_JOB_SCREEN.md) for detailed documentation.

## Installation

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+ with uv package manager

### Quick Setup

Use the provided colorized Python menu script for easy setup:

```bash
# Windows
menu.bat

# Or run directly with Python
python menu.py

# Options available:
# 1. Install dependencies: Option 1
# 2. Start both frontend and backend: Option 4
```

### Backend Services

Start the enhanced backend services with real-time monitoring:

```bash
# Windows
cd python-backend
start-backend.bat

# Linux/Mac
cd python-backend
chmod +x start-backend.sh
./start-backend.sh
```

This starts:
- **Job Management API** (Port 8000): Job lifecycle management
- **Training Monitor API** (Port 8001): Real-time metrics and monitoring

### Frontend

```bash
npm install
npm run dev  # Port 3000
```

### Manual Backend Installation

```bash
# Frontend
npm install
npm run dev

# Backend  
cd python-backend
uv venv
uv run main.py
```

## Tech Stack

**Frontend:**
- Next.js 14 with TypeScript
- Tailwind CSS for styling
- React hooks for state management

**Backend:**
- FastAPI with Python 3.11
- Pandas for CSV processing
- HuggingFace Hub integration
- uv for dependency management

## Folder Structure

```
├── src/
│   ├── app/                    # Next.js app router pages
│   │   └── finetuning/         # Fine-tuning workflow pages
│   ├── components/             # React components
│   │   ├── dataset-selection/  # Dataset management components
│   │   ├── model-selection/    # Model browsing and search
│   │   └── ui/                 # Reusable UI components
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript type definitions
│   ├── utils/                  # Utility functions and API clients
│   └── data/                   # Static data and fallback content
├── python-backend/             # FastAPI backend
│   ├── services/               # Business logic services
│   ├── main.py                 # FastAPI application
│   └── requirements.txt        # Python dependencies
├── public/                     # Static assets
├── docs/                       # Documentation
├── menu.py                     # Colorized setup menu (Python)
└── menu.bat                    # Windows launcher for menu.py
```