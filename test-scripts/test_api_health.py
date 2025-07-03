#!/usr/bin/env python3
"""
API Health Check Test Script
Tests all backend endpoints to ensure they're working correctly
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any

# API Configuration
MAIN_API_BASE = "http://127.0.0.1:8000"
TRAINING_API_BASE = "http://127.0.0.1:8001"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_test_header(test_name: str):
    print(f"\n{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}{Colors.BOLD}Testing: {test_name}{Colors.END}")
    print(f"{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.END}")

def print_success(message: str):
    print(f"{Colors.GREEN}✓ {message}{Colors.END}")

def print_error(message: str):
    print(f"{Colors.RED}✗ {message}{Colors.END}")

def print_warning(message: str):
    print(f"{Colors.YELLOW}⚠ {message}{Colors.END}")

def test_endpoint(url: str, description: str, timeout: int = 5) -> Dict[str, Any]:
    """Test a single endpoint and return results"""
    try:
        response = requests.get(url, timeout=timeout)
        if response.status_code == 200:
            print_success(f"{description} - Status: {response.status_code}")
            return {"success": True, "data": response.json(), "status": response.status_code}
        else:
            print_error(f"{description} - Status: {response.status_code}")
            return {"success": False, "status": response.status_code, "error": response.text}
    except requests.exceptions.ConnectionError:
        print_error(f"{description} - Connection failed (service not running?)")
        return {"success": False, "error": "Connection failed"}
    except requests.exceptions.Timeout:
        print_error(f"{description} - Timeout after {timeout}s")
        return {"success": False, "error": "Timeout"}
    except Exception as e:
        print_error(f"{description} - Error: {str(e)}")
        return {"success": False, "error": str(e)}

def test_main_api():
    """Test main API endpoints"""
    print_test_header("Main API (Port 8000)")
    
    endpoints = [
        (f"{MAIN_API_BASE}/", "Root endpoint"),
        (f"{MAIN_API_BASE}/api/health", "Health check"),
        (f"{MAIN_API_BASE}/api/models", "Models endpoint"),
        (f"{MAIN_API_BASE}/api/datasets", "Datasets endpoint"),
        (f"{MAIN_API_BASE}/api/jobs", "Jobs endpoint"),
        (f"{MAIN_API_BASE}/api/jobs/current", "Current jobs"),
        (f"{MAIN_API_BASE}/api/jobs/past", "Past jobs"),
        (f"{MAIN_API_BASE}/api/jobs/statistics", "Job statistics"),
        (f"{MAIN_API_BASE}/api/metadata", "Metadata endpoint"),
    ]
    
    results = []
    for url, description in endpoints:
        result = test_endpoint(url, description)
        results.append((description, result))
    
    return results

def test_training_api():
    """Test training/monitoring API endpoints"""
    print_test_header("Training API (Port 8001)")
    
    endpoints = [
        (f"{TRAINING_API_BASE}/", "Training API root"),
        (f"{TRAINING_API_BASE}/api/training/losses", "Training losses"),
        (f"{TRAINING_API_BASE}/api/training/losses/current", "Current training loss"),
        (f"{TRAINING_API_BASE}/api/training/resources", "Resource metrics"),
        (f"{TRAINING_API_BASE}/api/training/resources/current", "Current resources"),
        (f"{TRAINING_API_BASE}/api/training/status/test-job-123", "Training status"),
        (f"{TRAINING_API_BASE}/api/training/summary", "Training summary"),
        (f"{TRAINING_API_BASE}/api/training/mode", "Training mode"),
    ]
    
    results = []
    for url, description in endpoints:
        result = test_endpoint(url, description)
        results.append((description, result))
    
    return results

def test_data_integrity():
    """Test data integrity and relationships"""
    print_test_header("Data Integrity Tests")
    
    try:
        # Test models data
        models_response = requests.get(f"{MAIN_API_BASE}/api/models", timeout=5)
        if models_response.status_code == 200:
            models_data = models_response.json()
            if isinstance(models_data, dict) and 'models' in models_data:
                models_count = len(models_data['models'])
                print_success(f"Models data loaded: {models_count} models")
            else:
                print_warning("Models data format unexpected")
        
        # Test datasets data
        datasets_response = requests.get(f"{MAIN_API_BASE}/api/datasets", timeout=5)
        if datasets_response.status_code == 200:
            datasets_data = datasets_response.json()
            if isinstance(datasets_data, list):
                datasets_count = len(datasets_data)
                print_success(f"Datasets data loaded: {datasets_count} datasets")
            else:
                print_warning("Datasets data format unexpected")
        
        # Test job statistics
        stats_response = requests.get(f"{MAIN_API_BASE}/api/jobs/statistics", timeout=5)
        if stats_response.status_code == 200:
            stats_data = stats_response.json()
            print_success(f"Job statistics: {stats_data.get('total', 0)} total jobs")
        
        # Test training data availability
        training_response = requests.get(f"{TRAINING_API_BASE}/api/training/summary", timeout=5)
        if training_response.status_code == 200:
            training_data = training_response.json()
            print_success(f"Training data available - Mode: {training_data.get('training_mode', 'unknown')}")
        
    except Exception as e:
        print_error(f"Data integrity test failed: {str(e)}")

def test_frontend_connectivity():
    """Test if frontend is accessible"""
    print_test_header("Frontend Connectivity")
    
    try:
        # Test if Next.js frontend is running
        frontend_response = requests.get("http://localhost:3000", timeout=5)
        if frontend_response.status_code == 200:
            print_success("Frontend accessible on port 3000")
        else:
            print_warning(f"Frontend responded with status: {frontend_response.status_code}")
    except requests.exceptions.ConnectionError:
        print_warning("Frontend not running on port 3000")
    except Exception as e:
        print_error(f"Frontend test failed: {str(e)}")

def generate_test_report(main_results, training_results):
    """Generate a comprehensive test report"""
    print_test_header("Test Summary Report")
    
    total_tests = len(main_results) + len(training_results)
    successful_tests = sum(1 for _, result in main_results + training_results if result.get('success', False))
    
    print(f"\n{Colors.BOLD}Overall Results:{Colors.END}")
    print(f"Total tests: {total_tests}")
    print(f"Successful: {Colors.GREEN}{successful_tests}{Colors.END}")
    print(f"Failed: {Colors.RED}{total_tests - successful_tests}{Colors.END}")
    print(f"Success rate: {Colors.BOLD}{(successful_tests/total_tests*100):.1f}%{Colors.END}")
    
    # Detailed failures
    failed_tests = [(desc, result) for desc, result in main_results + training_results if not result.get('success', False)]
    if failed_tests:
        print(f"\n{Colors.RED}{Colors.BOLD}Failed Tests:{Colors.END}")
        for description, result in failed_tests:
            print(f"  - {description}: {result.get('error', 'Unknown error')}")
    
    # Recommendations
    print(f"\n{Colors.BOLD}Recommendations:{Colors.END}")
    if successful_tests == total_tests:
        print_success("All tests passed! Your application is ready for use.")
    else:
        print_warning("Some tests failed. Check the following:")
        if any("Connection failed" in result.get('error', '') for _, result in failed_tests):
            print("  - Ensure both backend services are running (ports 8000 and 8001)")
        if any("8000" in desc for desc, _ in failed_tests):
            print("  - Start main backend: cd python-backend && uv run python main.py")
        if any("8001" in desc for desc, _ in failed_tests):
            print("  - Start training API: cd python-backend && uv run python mock_training_api.py")

def main():
    """Run all tests"""
    print(f"{Colors.BOLD}AI Fine-tuning Dashboard - API Health Check{Colors.END}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Run all test suites
    main_results = test_main_api()
    training_results = test_training_api()
    test_data_integrity()
    test_frontend_connectivity()
    
    # Generate report
    generate_test_report(main_results, training_results)
    
    # Return exit code based on results
    total_success = all(result.get('success', False) for _, result in main_results + training_results)
    sys.exit(0 if total_success else 1)

if __name__ == "__main__":
    main()
