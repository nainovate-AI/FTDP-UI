#!/usr/bin/env python3
"""
Quick Start Script
Quickly validates that all services are running and provides startup commands
"""

import requests
import subprocess
import sys
import time
from typing import Dict, Any, List, Tuple

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_header(title: str):
    print(f"\n{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}{Colors.BOLD}{title}{Colors.END}")
    print(f"{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.END}")

def print_success(message: str):
    print(f"{Colors.GREEN}✓ {message}{Colors.END}")

def print_error(message: str):
    print(f"{Colors.RED}✗ {message}{Colors.END}")

def print_info(message: str):
    print(f"{Colors.BLUE}ℹ {message}{Colors.END}")

def print_warning(message: str):
    print(f"{Colors.YELLOW}⚠ {message}{Colors.END}")

def check_service(name: str, url: str, timeout: int = 5) -> Tuple[bool, str]:
    """Check if a service is running"""
    try:
        response = requests.get(url, timeout=timeout)
        if response.status_code == 200:
            return True, f"Service running (Status: {response.status_code})"
        else:
            return False, f"Service responded with status: {response.status_code}"
    except requests.exceptions.ConnectionError:
        return False, "Connection refused (service not running)"
    except requests.exceptions.Timeout:
        return False, f"Timeout after {timeout}s"
    except Exception as e:
        return False, f"Error: {str(e)}"

def check_all_services() -> Dict[str, Tuple[bool, str]]:
    """Check all required services"""
    services = {
        "Main API (Port 8000)": "http://127.0.0.1:8000/api/health",
        "Training API (Port 8001)": "http://127.0.0.1:8001/",
        "Frontend (Port 3000)": "http://localhost:3000"
    }
    
    results = {}
    for name, url in services.items():
        results[name] = check_service(name, url)
    
    return results

def print_service_status(results: Dict[str, Tuple[bool, str]]):
    """Print status of all services"""
    print_header("Service Status Check")
    
    all_running = True
    for service_name, (is_running, message) in results.items():
        if is_running:
            print_success(f"{service_name}: {message}")
        else:
            print_error(f"{service_name}: {message}")
            all_running = False
    
    return all_running

def print_startup_commands():
    """Print commands to start services"""
    print_header("Service Startup Commands")
    
    print(f"{Colors.BOLD}To start the services, run these commands in separate terminals:{Colors.END}\n")
    
    print(f"{Colors.YELLOW}Terminal 1 - Main Backend API:{Colors.END}")
    print("cd python-backend")
    print("uv run python main.py")
    print()
    
    print(f"{Colors.YELLOW}Terminal 2 - Training Monitor API:{Colors.END}")
    print("cd python-backend")
    print("uv run python mock_training_api.py")
    print()
    
    print(f"{Colors.YELLOW}Terminal 3 - Frontend (Next.js):{Colors.END}")
    print("npm run dev")
    print()

def run_quick_health_check():
    """Run a quick health check on APIs"""
    print_header("Quick Health Check")
    
    try:
        # Test main API endpoints
        endpoints = [
            ("Models API", "http://127.0.0.1:8000/api/models"),
            ("Datasets API", "http://127.0.0.1:8000/api/datasets"),
            ("Jobs API", "http://127.0.0.1:8000/api/jobs/statistics"),
            ("Training Summary", "http://127.0.0.1:8001/api/training/summary"),
        ]
        
        for name, url in endpoints:
            try:
                response = requests.get(url, timeout=3)
                if response.status_code == 200:
                    print_success(f"{name} - Working")
                else:
                    print_warning(f"{name} - Status: {response.status_code}")
            except Exception:
                print_error(f"{name} - Not accessible")
    
    except Exception as e:
        print_error(f"Health check error: {str(e)}")

def print_useful_urls():
    """Print useful URLs for the application"""
    print_header("Useful URLs")
    
    urls = [
        ("Frontend Dashboard", "http://localhost:3000"),
        ("Main API Docs", "http://127.0.0.1:8000/docs"),
        ("Training API Docs", "http://127.0.0.1:8001/docs"),
        ("API Health Check", "http://127.0.0.1:8000/api/health"),
        ("Training Summary", "http://127.0.0.1:8001/api/training/summary"),
        ("Models API", "http://127.0.0.1:8000/api/models"),
        ("Jobs API", "http://127.0.0.1:8000/api/jobs"),
    ]
    
    for name, url in urls:
        print(f"{Colors.BLUE}• {name}:{Colors.END} {url}")

def print_test_commands():
    """Print available test commands"""
    print_header("Available Test Scripts")
    
    test_scripts = [
        ("API Health Check", "python test-scripts/test_api_health.py", "Test all API endpoints"),
        ("Data Operations", "python test-scripts/test_data_operations.py", "Test CRUD operations"),
        ("Training Simulation", "python test-scripts/test_training_simulation.py", "Test training monitoring"),
        ("End-to-End Workflow", "python test-scripts/test_e2e_workflow.py", "Complete workflow test"),
    ]
    
    print("Run these commands to test specific functionality:\n")
    
    for name, command, description in test_scripts:
        print(f"{Colors.GREEN}• {name}:{Colors.END}")
        print(f"  Command: {Colors.YELLOW}{command}{Colors.END}")
        print(f"  Purpose: {description}\n")

def main():
    """Main quick start function"""
    print(f"{Colors.BOLD}🚀 AI Fine-tuning Dashboard - Quick Start{Colors.END}")
    print("Checking service status and providing startup guidance\n")
    
    # Check service status
    service_results = check_all_services()
    all_services_running = print_service_status(service_results)
    
    if all_services_running:
        print_success("\n🎉 All services are running!")
        run_quick_health_check()
        print_useful_urls()
        print_test_commands()
        
        print_header("Next Steps")
        print("✓ All services are operational")
        print("✓ Open http://localhost:3000 to use the dashboard")
        print("✓ Run test scripts to validate functionality")
        print("✓ Start creating fine-tuning jobs!")
        
    else:
        print_error("\n❌ Some services are not running")
        print_startup_commands()
        
        print_header("Troubleshooting")
        print("1. Make sure you're in the correct directory")
        print("2. Check if ports 3000, 8000, and 8001 are available")
        print("3. Ensure all dependencies are installed:")
        print("   • cd python-backend && uv sync")
        print("   • npm install")
        print("4. Run the test scripts after starting services")
        
        print_test_commands()
    
    # Print final status
    print_header("Status Summary")
    running_count = sum(1 for is_running, _ in service_results.values() if is_running)
    total_count = len(service_results)
    
    if running_count == total_count:
        print_success(f"All {total_count} services are operational ✓")
        sys.exit(0)
    else:
        print_warning(f"{running_count}/{total_count} services running")
        print_info("Start the missing services and run this script again")
        sys.exit(1)

if __name__ == "__main__":
    main()
