#!/bin/bash

# Nainovate AI Backend Startup Script
# This script starts both the job management API and training monitor API

echo "🚀 Starting Nainovate AI Backend Services..."
echo "================================================="

# Check if Python is available
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed or not in PATH"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "main.py" ] || [ ! -f "training_monitor_api.py" ]; then
    echo "❌ Please run this script from the python-backend directory"
    echo "   Expected files: main.py, training_monitor_api.py"
    exit 1
fi

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "📦 Installing Python dependencies..."
    python -m pip install -r requirements.txt
fi

# Function to start a service in the background
start_service() {
    local service_name=$1
    local script_name=$2
    local port=$3
    
    echo "🌐 Starting $service_name on port $port..."
    python "$script_name" &
    local pid=$!
    echo "   ✅ $service_name started with PID $pid"
    echo "$pid" > "${service_name,,}.pid"
}

# Create logs directory if it doesn't exist
mkdir -p logs

# Start Job Management API (Port 8000)
start_service "Job-Management-API" "main.py" "8000"

# Wait a moment for the first service to initialize
sleep 2

# Start Training Monitor API (Port 8001)
start_service "Training-Monitor-API" "training_monitor_api.py" "8001"

echo ""
echo "🎉 Backend services started successfully!"
echo "================================================="
echo "📊 Job Management API:    http://localhost:8000"
echo "📈 Training Monitor API:   http://localhost:8001"
echo ""
echo "📖 Available endpoints:"
echo "   • Job Management:    http://localhost:8000/docs"
echo "   • Training Monitor:  http://localhost:8001/docs"
echo ""
echo "🛑 To stop all services, run: ./stop-backend.sh"
echo "📝 Check logs with: tail -f logs/backend.log"

# Create stop script
cat > stop-backend.sh << 'EOF'
#!/bin/bash

echo "🛑 Stopping Nainovate AI Backend Services..."

# Function to stop a service
stop_service() {
    local service_name=$1
    local pid_file="${service_name,,}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo "🔄 Stopping $service_name (PID: $pid)..."
            kill "$pid"
            rm "$pid_file"
            echo "   ✅ $service_name stopped"
        else
            echo "   ⚠️  $service_name was not running"
            rm "$pid_file"
        fi
    else
        echo "   ℹ️  No PID file found for $service_name"
    fi
}

# Stop services
stop_service "Job-Management-API"
stop_service "Training-Monitor-API"

# Clean up any remaining Python processes on our ports
echo "🧹 Cleaning up any remaining processes..."
pkill -f "main.py" 2>/dev/null || true
pkill -f "training_monitor_api.py" 2>/dev/null || true

echo ""
echo "✅ All backend services stopped successfully!"
EOF

chmod +x stop-backend.sh

echo "📝 Created stop-backend.sh for easy service management"
