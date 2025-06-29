# AI Fine-tuning Dashboard

A modern, React-based dashboard for managing AI model fine-tuning workflows with HuggingFace model integration and real-time dataset processing.

## Description

This application provides a comprehensive platform for AI practitioners to manage their fine-tuning workflows, from dataset selection and validation to model configuration and training setup. Features include real-time CSV processing, HuggingFace model search and integration, and a guided multi-step workflow.

## Scope & Progress

- ✅ **Dataset Management** - Upload, validate, and preview CSV datasets
- ✅ **Model Selection** - Browse and search HuggingFace models with real-time integration  
- ✅ **Backend Integration** - Python FastAPI backend for CSV processing and model management
- 🔄 **Configuration Setup** - Training parameters and configuration (In Progress)
- 🔄 **Training Management** - Job execution and monitoring (Planned)
- 🔄 **Deployment** - Model deployment and serving (Planned)

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

### Manual Installation

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