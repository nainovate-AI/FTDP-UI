# AI Fine-tuning Dashboard - Windows Startup Script
# This script starts all required services for the AI Fine-tuning Dashboard

param(
    [switch]$SkipFrontend,
    [switch]$SkipTests,
    [switch]$Help
)

if ($Help) {
    Write-Host "AI Fine-tuning Dashboard Startup Script" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\start-services.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -SkipFrontend    Skip starting the frontend (Next.js)"
    Write-Host "  -SkipTests       Skip running initial tests"
    Write-Host "  -Help            Show this help message"
    Write-Host ""
    Write-Host "This script will start:"
    Write-Host "  • Main Backend API (Port 8000)"
    Write-Host "  • Training Monitor API (Port 8001)"
    Write-Host "  • Frontend Dashboard (Port 3000)"
    Write-Host ""
    exit 0
}

function Write-Status {
    param($Message, $Status = "INFO")
    $color = switch ($Status) {
        "SUCCESS" { "Green" }
        "ERROR" { "Red" }
        "WARNING" { "Yellow" }
        "INFO" { "Cyan" }
        default { "White" }
    }
    Write-Host "[$Status] $Message" -ForegroundColor $color
}

function Test-Port {
    param($Port)
    try {
        $connection = Test-NetConnection -ComputerName "localhost" -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
        return $connection
    } catch {
        return $false
    }
}

function Wait-ForService {
    param($Name, $Port, $MaxWaitSeconds = 30)
    Write-Status "Waiting for $Name to start on port $Port..." "INFO"
    
    $waited = 0
    while ($waited -lt $MaxWaitSeconds) {
        if (Test-Port -Port $Port) {
            Write-Status "$Name is now running on port $Port" "SUCCESS"
            return $true
        }
        Start-Sleep -Seconds 2
        $waited += 2
        Write-Host "." -NoNewline
    }
    
    Write-Host ""
    Write-Status "$Name failed to start within $MaxWaitSeconds seconds" "ERROR"
    return $false
}

# Main script
Write-Host "🚀 AI Fine-tuning Dashboard - Windows Startup" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path "python-backend")) {
    Write-Status "Error: python-backend directory not found!" "ERROR"
    Write-Status "Please run this script from the root directory of the project" "ERROR"
    exit 1
}

if (-not (Test-Path "package.json")) {
    Write-Status "Error: package.json not found!" "ERROR"
    Write-Status "Please run this script from the root directory of the project" "ERROR"
    exit 1
}

# Check for existing processes on required ports
$ports = @(8000, 8001)
if (-not $SkipFrontend) {
    $ports += 3000
}

foreach ($port in $ports) {
    if (Test-Port -Port $port) {
        Write-Status "Warning: Port $port is already in use" "WARNING"
        $response = Read-Host "Continue anyway? (y/N)"
        if ($response -ne "y" -and $response -ne "Y") {
            Write-Status "Startup cancelled" "INFO"
            exit 1
        }
    }
}

Write-Status "Starting services..." "INFO"

# Start Main Backend API (Port 8000)
Write-Status "Starting Main Backend API..." "INFO"
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location python-backend
    uv run python main.py
} -Name "MainBackend"

Start-Sleep -Seconds 3

# Start Training Monitor API (Port 8001)
Write-Status "Starting Training Monitor API..." "INFO"
$trainingJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location python-backend
    uv run python mock_training_api.py
} -Name "TrainingAPI"

Start-Sleep -Seconds 3

# Start Frontend (Port 3000) if not skipped
if (-not $SkipFrontend) {
    Write-Status "Starting Frontend Dashboard..." "INFO"
    $frontendJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        npm run dev
    } -Name "Frontend"
}

# Wait for services to be ready
Write-Host ""
Write-Status "Waiting for services to start..." "INFO"

$servicesReady = $true

# Wait for Main Backend
if (-not (Wait-ForService -Name "Main Backend API" -Port 8000)) {
    $servicesReady = $false
}

# Wait for Training API
if (-not (Wait-ForService -Name "Training Monitor API" -Port 8001)) {
    $servicesReady = $false
}

# Wait for Frontend
if (-not $SkipFrontend) {
    if (-not (Wait-ForService -Name "Frontend Dashboard" -Port 3000 -MaxWaitSeconds 60)) {
        $servicesReady = $false
    }
}

Write-Host ""

if ($servicesReady) {
    Write-Status "🎉 All services started successfully!" "SUCCESS"
    Write-Host ""
    Write-Host "Available URLs:" -ForegroundColor Cyan
    Write-Host "• Frontend Dashboard:  http://localhost:3000" -ForegroundColor Green
    Write-Host "• Main API:           http://127.0.0.1:8000" -ForegroundColor Green
    Write-Host "• API Documentation:  http://127.0.0.1:8000/docs" -ForegroundColor Green
    Write-Host "• Training API:       http://127.0.0.1:8001" -ForegroundColor Green
    Write-Host "• Training API Docs:  http://127.0.0.1:8001/docs" -ForegroundColor Green
    
    if (-not $SkipTests) {
        Write-Host ""
        Write-Status "Running quick health check..." "INFO"
        try {
            python test-scripts/quick_start.py
        } catch {
            Write-Status "Health check failed, but services appear to be running" "WARNING"
        }
    }
    
    Write-Host ""
    Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
    Write-Host "• Open http://localhost:3000 in your browser"
    Write-Host "• Upload a dataset and select a model"
    Write-Host "• Create and monitor fine-tuning jobs"
    Write-Host ""
    Write-Host "📋 Available Test Commands:" -ForegroundColor Cyan
    Write-Host "• python test-scripts/test_api_health.py"
    Write-Host "• python test-scripts/test_data_operations.py"
    Write-Host "• python test-scripts/test_training_simulation.py"
    Write-Host "• python test-scripts/test_e2e_workflow.py"
    
} else {
    Write-Status "❌ Some services failed to start" "ERROR"
    Write-Status "Check the job outputs for error details" "INFO"
}

Write-Host ""
Write-Host "Job Management:" -ForegroundColor Cyan
Write-Host "• View job status: Get-Job"
Write-Host "• View job output: Receive-Job -Name [JobName] -Keep"
Write-Host "• Stop all jobs: Get-Job | Stop-Job; Get-Job | Remove-Job"

# Keep the script running to maintain jobs
Write-Host ""
Write-Status "Press Ctrl+C to stop all services" "INFO"

try {
    while ($true) {
        Start-Sleep -Seconds 5
        
        # Check if jobs are still running
        $runningJobs = Get-Job | Where-Object { $_.State -eq "Running" }
        if ($runningJobs.Count -eq 0) {
            Write-Status "All background jobs have stopped" "WARNING"
            break
        }
    }
} catch {
    Write-Status "Shutting down services..." "INFO"
} finally {
    # Clean up background jobs
    Get-Job | Stop-Job
    Get-Job | Remove-Job
    Write-Status "All services stopped" "INFO"
}
