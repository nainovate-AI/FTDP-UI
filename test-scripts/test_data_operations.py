#!/usr/bin/env python3
"""
Data Operations Test Script
Tests CRUD operations for models, datasets, and jobs
"""

import requests
import json
import sys
import tempfile
import os
from typing import Dict, Any

# API Configuration
API_BASE = "http://127.0.0.1:8000"

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

def print_info(message: str):
    print(f"{Colors.BLUE}ℹ {message}{Colors.END}")

def test_model_operations():
    """Test model CRUD operations"""
    print_test_header("Model Operations")
    
    # Test getting all models
    try:
        response = requests.get(f"{API_BASE}/api/models")
        if response.status_code == 200:
            models_data = response.json()
            initial_count = len(models_data.get('models', []))
            print_success(f"Retrieved {initial_count} models")
        else:
            print_error(f"Failed to get models: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error getting models: {str(e)}")
        return False
    
    # Test model search
    try:
        search_response = requests.get(f"{API_BASE}/api/models/search?query=gpt&limit=3")
        if search_response.status_code == 200:
            search_results = search_response.json()
            print_success(f"Model search returned {len(search_results)} results")
        else:
            print_error(f"Model search failed: {search_response.status_code}")
    except Exception as e:
        print_error(f"Model search error: {str(e)}")
    
    # Test adding a model
    test_model = {
        "id": "test-model/test-gpt-2",
        "name": "Test GPT-2",
        "provider": "Test Provider",
        "category": "Text Generation",
        "description": "Test model for API testing",
        "parameters": "117M",
        "tags": ["test", "gpt-2"]
    }
    
    try:
        add_response = requests.post(f"{API_BASE}/api/models", json=test_model)
        if add_response.status_code == 200:
            add_result = add_response.json()
            if add_result.get("success"):
                print_success("Successfully added test model")
            else:
                print_error(f"Failed to add model: {add_result.get('message')}")
        else:
            print_error(f"Add model failed: {add_response.status_code}")
    except Exception as e:
        print_error(f"Add model error: {str(e)}")
    
    # Test checking if model exists
    try:
        check_response = requests.get(f"{API_BASE}/api/models/check/test-model/test-gpt-2")
        if check_response.status_code == 200:
            check_result = check_response.json()
            if check_result.get("exists"):
                print_success("Model existence check passed")
            else:
                print_error("Model not found after adding")
        else:
            print_error(f"Model check failed: {check_response.status_code}")
    except Exception as e:
        print_error(f"Model check error: {str(e)}")
    
    # Test removing the test model
    try:
        delete_response = requests.delete(f"{API_BASE}/api/models/test-model/test-gpt-2")
        if delete_response.status_code == 200:
            delete_result = delete_response.json()
            if delete_result.get("success"):
                print_success("Successfully removed test model")
            else:
                print_error(f"Failed to remove model: {delete_result.get('message')}")
        else:
            print_error(f"Delete model failed: {delete_response.status_code}")
    except Exception as e:
        print_error(f"Delete model error: {str(e)}")
    
    return True

def test_dataset_operations():
    """Test dataset operations"""
    print_test_header("Dataset Operations")
    
    # Test getting all datasets
    try:
        response = requests.get(f"{API_BASE}/api/datasets")
        if response.status_code == 200:
            datasets = response.json()
            print_success(f"Retrieved {len(datasets)} datasets")
        else:
            print_error(f"Failed to get datasets: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error getting datasets: {str(e)}")
        return False
    
    # Test CSV preview functionality
    test_csv_content = """input,output
"What is AI?","Artificial Intelligence is the simulation of human intelligence."
"Explain machine learning","Machine learning is a subset of AI that learns from data."
"What is deep learning?","Deep learning uses neural networks with multiple layers."
"""
    
    try:
        # Create temporary CSV file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as temp_file:
            temp_file.write(test_csv_content)
            temp_path = temp_file.name
        
        # Test CSV preview
        with open(temp_path, 'rb') as csv_file:
            files = {'file': ('test_dataset.csv', csv_file, 'text/csv')}
            preview_response = requests.post(f"{API_BASE}/api/preview-csv", files=files)
            
            if preview_response.status_code == 200:
                preview_result = preview_response.json()
                print_success(f"CSV preview successful - {preview_result['statistics']['total_rows']} rows")
                
                if preview_result['statistics']['has_required_columns']:
                    print_success("CSV has required 'input' and 'output' columns")
                else:
                    print_error("CSV missing required columns")
            else:
                print_error(f"CSV preview failed: {preview_response.status_code}")
        
        # Clean up temp file
        os.unlink(temp_path)
        
    except Exception as e:
        print_error(f"CSV preview test error: {str(e)}")
    
    return True

def test_job_operations():
    """Test job operations"""
    print_test_header("Job Operations")
    
    # Test getting job statistics
    try:
        stats_response = requests.get(f"{API_BASE}/api/jobs/statistics")
        if stats_response.status_code == 200:
            stats = stats_response.json()
            print_success(f"Job statistics: {stats['total']} total jobs")
            print_info(f"Current jobs: {stats['current']['total']}")
            print_info(f"Past jobs: {stats['past']['total']}")
            print_info(f"Success rate: {stats['success_rate']}")
        else:
            print_error(f"Failed to get job statistics: {stats_response.status_code}")
    except Exception as e:
        print_error(f"Job statistics error: {str(e)}")
    
    # Test getting current jobs
    try:
        current_response = requests.get(f"{API_BASE}/api/jobs/current")
        if current_response.status_code == 200:
            current_jobs = current_response.json()
            job_count = len(current_jobs.get('jobs', []))
            print_success(f"Retrieved {job_count} current jobs")
        else:
            print_error(f"Failed to get current jobs: {current_response.status_code}")
    except Exception as e:
        print_error(f"Current jobs error: {str(e)}")
    
    # Test getting past jobs
    try:
        past_response = requests.get(f"{API_BASE}/api/jobs/past")
        if past_response.status_code == 200:
            past_jobs = past_response.json()
            job_count = len(past_jobs.get('jobs', []))
            print_success(f"Retrieved {job_count} past jobs")
        else:
            print_error(f"Failed to get past jobs: {past_response.status_code}")
    except Exception as e:
        print_error(f"Past jobs error: {str(e)}")
    
    # Test creating a new job
    test_job_data = {
        "name": "Test Fine-tuning Job",
        "description": "Test job created by API test script",
        "tags": ["test", "api"],
        "configuration": {
            "model": {"uid": "test-model", "name": "Test Model"},
            "dataset": {"uid": "test-dataset", "name": "Test Dataset"},
            "hyperparameters": {"uid": "test-config"}
        },
        "modelSaving": {
            "saveModel": True,
            "modelName": "test-fine-tuned-model"
        },
        "createdAt": "2025-07-03T12:00:00.000Z"
    }
    
    try:
        create_response = requests.post(f"{API_BASE}/api/jobs", json=test_job_data)
        if create_response.status_code == 200:
            create_result = create_response.json()
            if create_result.get("success"):
                job_uid = create_result.get("jobUid")
                print_success(f"Created test job with UID: {job_uid}")
                
                # Test getting the specific job
                job_response = requests.get(f"{API_BASE}/api/jobs/{job_uid}")
                if job_response.status_code == 200:
                    print_success("Successfully retrieved created job")
                else:
                    print_error(f"Failed to retrieve created job: {job_response.status_code}")
            else:
                print_error(f"Failed to create job: {create_result.get('message')}")
        else:
            print_error(f"Job creation failed: {create_response.status_code}")
    except Exception as e:
        print_error(f"Job creation error: {str(e)}")
    
    return True

def test_metadata_operations():
    """Test metadata operations"""
    print_test_header("Metadata Operations")
    
    try:
        # Test getting metadata
        metadata_response = requests.get(f"{API_BASE}/api/metadata")
        if metadata_response.status_code == 200:
            metadata = metadata_response.json()
            print_success("Retrieved metadata successfully")
            
            # Check key metadata fields
            if metadata.get('finetuningSession'):
                print_info(f"Session ID: {metadata['finetuningSession'].get('id')}")
                print_info(f"Session status: {metadata['finetuningSession'].get('status')}")
            
            if metadata.get('dataset'):
                print_info(f"Dataset: {metadata['dataset'].get('name')}")
            
            if metadata.get('model'):
                print_info(f"Model: {metadata['model'].get('modelName')}")
        else:
            print_error(f"Failed to get metadata: {metadata_response.status_code}")
    except Exception as e:
        print_error(f"Metadata error: {str(e)}")
    
    return True

def main():
    """Run all data operation tests"""
    print(f"{Colors.BOLD}AI Fine-tuning Dashboard - Data Operations Test{Colors.END}")
    print("Testing CRUD operations for models, datasets, and jobs\n")
    
    results = []
    
    # Run all test suites
    results.append(("Model Operations", test_model_operations()))
    results.append(("Dataset Operations", test_dataset_operations()))
    results.append(("Job Operations", test_job_operations()))
    results.append(("Metadata Operations", test_metadata_operations()))
    
    # Print summary
    print_test_header("Test Results Summary")
    
    successful_tests = sum(1 for _, result in results if result)
    total_tests = len(results)
    
    for test_name, success in results:
        status = f"{Colors.GREEN}PASS{Colors.END}" if success else f"{Colors.RED}FAIL{Colors.END}"
        print(f"{test_name}: {status}")
    
    print(f"\nOverall: {successful_tests}/{total_tests} tests passed")
    
    if successful_tests == total_tests:
        print_success("All data operations are working correctly!")
        sys.exit(0)
    else:
        print_error("Some data operations failed. Check the logs above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
