#!/bin/bash

# AI Fine-tuning Dashboard - Linux/Mac Startup Script
# This script starts all required services for the AI Fine-tuning Dashboard

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
SKIP_FRONTEND=false
SKIP_TESTS=false
SHOW_HELP=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-frontend)
            SKIP_FRONTEND=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --help|-h)
            SHOW_HELP=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Show help
if [ "$SHOW_HELP" = true ]; then
    echo -e "${CYAN}${BOLD}AI Fine-tuning Dashboard Startup Script${NC}"
    echo ""
    echo "Usage: ./start-services.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --skip-frontend    Skip starting the frontend (Next.js)"
    echo "  --skip-tests       Skip running initial tests"
    echo "  --help, -h         Show this help message"
    echo ""
    echo "This script will start:"
    echo "  • Main Backend API (Port 8000)"
    echo "  • Training Monitor API (Port 8001)"
    echo "  • Frontend Dashboard (Port 3000)"
    echo ""
    exit 0
fi

# Helper functions
log_status() {
    local level=$1
    local message=$2
    local color=""
    
    case $level in
        "SUCCESS") color=$GREEN ;;
        "ERROR") color=$RED ;;
        "WARNING") color=$YELLOW ;;
        "INFO") color=$CYAN ;;
        *) color=$NC ;;
    esac
    
    echo -e "${color}[$level]${NC} $message"
}

check_port() {
    local port=$1
    if command -v lsof > /dev/null; then
        lsof -ti:$port > /dev/null 2>&1
    elif command -v netstat > /dev/null; then
        netstat -tuln | grep ":$port " > /dev/null 2>&1
    else
        # Fallback: try to connect
        timeout 1 bash -c "echo >/dev/tcp/localhost/$port" > /dev/null 2>&1
    fi
}

wait_for_service() {
    local name=$1
    local port=$2
    local max_wait=${3:-30}
    
    log_status "INFO" "Waiting for $name to start on port $port..."
    
    local waited=0
    while [ $waited -lt $max_wait ]; do
        if check_port $port; then
            log_status "SUCCESS" "$name is now running on port $port"
            return 0
        fi
        sleep 2
        waited=$((waited + 2))
        echo -n "."
    done
    
    echo ""
    log_status "ERROR" "$name failed to start within $max_wait seconds"
    return 1
}

cleanup() {
    log_status "INFO" "Shutting down services..."
    
    # Kill background jobs
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID > /dev/null 2>&1
    fi
    
    if [ ! -z "$TRAINING_PID" ]; then
        kill $TRAINING_PID > /dev/null 2>&1
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID > /dev/null 2>&1
    fi
    
    # Kill any remaining processes on our ports
    for port in 8000 8001 3000; do
        if check_port $port; then
            if command -v lsof > /dev/null; then
                local pid=$(lsof -ti:$port)
                if [ ! -z "$pid" ]; then
                    kill $pid > /dev/null 2>&1
                fi
            fi
        fi
    done
    
    log_status "INFO" "All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main script
echo -e "${CYAN}${BOLD}🚀 AI Fine-tuning Dashboard - Startup Script${NC}"
echo -e "${CYAN}${BOLD}=============================================${NC}"
echo ""

# Check if we're in the correct directory
if [ ! -d "python-backend" ]; then
    log_status "ERROR" "python-backend directory not found!"
    log_status "ERROR" "Please run this script from the root directory of the project"
    exit 1
fi

if [ ! -f "package.json" ]; then
    log_status "ERROR" "package.json not found!"
    log_status "ERROR" "Please run this script from the root directory of the project"
    exit 1
fi

# Check for existing processes on required ports
ports=(8000 8001)
if [ "$SKIP_FRONTEND" = false ]; then
    ports+=(3000)
fi

for port in "${ports[@]}"; do
    if check_port $port; then
        log_status "WARNING" "Port $port is already in use"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_status "INFO" "Startup cancelled"
            exit 1
        fi
    fi
done

log_status "INFO" "Starting services..."

# Start Main Backend API (Port 8000)
log_status "INFO" "Starting Main Backend API..."
cd python-backend
uv run python main.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

sleep 3

# Start Training Monitor API (Port 8001)
log_status "INFO" "Starting Training Monitor API..."
cd python-backend
uv run python mock_training_api.py > ../logs/training.log 2>&1 &
TRAINING_PID=$!
cd ..

sleep 3

# Start Frontend (Port 3000) if not skipped
if [ "$SKIP_FRONTEND" = false ]; then
    log_status "INFO" "Starting Frontend Dashboard..."
    npm run dev > logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Wait for services to be ready
echo ""
log_status "INFO" "Waiting for services to start..."

services_ready=true

# Wait for Main Backend
if ! wait_for_service "Main Backend API" 8000; then
    services_ready=false
fi

# Wait for Training API
if ! wait_for_service "Training Monitor API" 8001; then
    services_ready=false
fi

# Wait for Frontend
if [ "$SKIP_FRONTEND" = false ]; then
    if ! wait_for_service "Frontend Dashboard" 3000 60; then
        services_ready=false
    fi
fi

echo ""

if [ "$services_ready" = true ]; then
    log_status "SUCCESS" "🎉 All services started successfully!"
    echo ""
    echo -e "${CYAN}Available URLs:${NC}"
    echo -e "${GREEN}• Frontend Dashboard:  http://localhost:3000${NC}"
    echo -e "${GREEN}• Main API:           http://127.0.0.1:8000${NC}"
    echo -e "${GREEN}• API Documentation:  http://127.0.0.1:8000/docs${NC}"
    echo -e "${GREEN}• Training API:       http://127.0.0.1:8001${NC}"
    echo -e "${GREEN}• Training API Docs:  http://127.0.0.1:8001/docs${NC}"
    
    if [ "$SKIP_TESTS" = false ]; then
        echo ""
        log_status "INFO" "Running quick health check..."
        if command -v python3 > /dev/null; then
            python3 test-scripts/quick_start.py
        elif command -v python > /dev/null; then
            python test-scripts/quick_start.py
        else
            log_status "WARNING" "Python not found, skipping health check"
        fi
    fi
    
    echo ""
    echo -e "${CYAN}🎯 Next Steps:${NC}"
    echo "• Open http://localhost:3000 in your browser"
    echo "• Upload a dataset and select a model"
    echo "• Create and monitor fine-tuning jobs"
    echo ""
    echo -e "${CYAN}📋 Available Test Commands:${NC}"
    echo "• python test-scripts/test_api_health.py"
    echo "• python test-scripts/test_data_operations.py"
    echo "• python test-scripts/test_training_simulation.py"
    echo "• python test-scripts/test_e2e_workflow.py"
    
else
    log_status "ERROR" "❌ Some services failed to start"
    log_status "INFO" "Check the log files in ./logs/ for error details"
fi

echo ""
echo -e "${CYAN}Log Files:${NC}"
echo "• Backend API: logs/backend.log"
echo "• Training API: logs/training.log"
if [ "$SKIP_FRONTEND" = false ]; then
    echo "• Frontend: logs/frontend.log"
fi

echo ""
log_status "INFO" "Press Ctrl+C to stop all services"

# Keep the script running to maintain services
while true; do
    sleep 5
    
    # Check if processes are still running
    if [ ! -z "$BACKEND_PID" ] && ! kill -0 $BACKEND_PID > /dev/null 2>&1; then
        log_status "WARNING" "Backend API process has stopped"
        BACKEND_PID=""
    fi
    
    if [ ! -z "$TRAINING_PID" ] && ! kill -0 $TRAINING_PID > /dev/null 2>&1; then
        log_status "WARNING" "Training API process has stopped"
        TRAINING_PID=""
    fi
    
    if [ "$SKIP_FRONTEND" = false ] && [ ! -z "$FRONTEND_PID" ] && ! kill -0 $FRONTEND_PID > /dev/null 2>&1; then
        log_status "WARNING" "Frontend process has stopped"
        FRONTEND_PID=""
    fi
    
    # If all processes have stopped, exit
    if [ -z "$BACKEND_PID" ] && [ -z "$TRAINING_PID" ] && ([ "$SKIP_FRONTEND" = true ] || [ -z "$FRONTEND_PID" ]); then
        log_status "INFO" "All services have stopped"
        break
    fi
done
