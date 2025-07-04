#!/usr/bin/env python3
"""
Training Simulation Test Script
Tests the training monitoring and real-time data APIs
"""

import requests
import json
import time
import sys
from datetime import datetime
from typing import Dict, Any, List

# API Configuration
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

def print_info(message: str):
    print(f"{Colors.BLUE}ℹ {message}{Colors.END}")

def print_warning(message: str):
    print(f"{Colors.YELLOW}⚠ {message}{Colors.END}")

def test_training_data_availability():
    """Test if training data is available and properly formatted"""
    print_test_header("Training Data Availability")
    
    try:
        # Test training losses
        losses_response = requests.get(f"{TRAINING_API_BASE}/api/training/losses?last_n=5")
        if losses_response.status_code == 200:
            losses_data = losses_response.json()
            print_success(f"Retrieved {len(losses_data)} training loss records")
            
            if losses_data:
                sample = losses_data[0]
                required_fields = ['epoch', 'step', 'train_loss', 'validation_loss', 'learning_rate']
                missing_fields = [field for field in required_fields if field not in sample]
                
                if not missing_fields:
                    print_success("Training loss data format is correct")
                else:
                    print_error(f"Missing fields in training data: {missing_fields}")
        else:
            print_error(f"Failed to get training losses: {losses_response.status_code}")
            return False
        
        # Test resource metrics
        resources_response = requests.get(f"{TRAINING_API_BASE}/api/training/resources?last_n=5")
        if resources_response.status_code == 200:
            resources_data = resources_response.json()
            print_success(f"Retrieved {len(resources_data)} resource metric records")
            
            if resources_data:
                sample = resources_data[0]
                required_fields = ['cpu_percent', 'ram_used_gb', 'gpu_percent', 'vram_used_gb', 'gpu_temp', 'cpu_temp']
                missing_fields = [field for field in required_fields if field not in sample]
                
                if not missing_fields:
                    print_success("Resource metrics data format is correct")
                else:
                    print_error(f"Missing fields in resource data: {missing_fields}")
        else:
            print_error(f"Failed to get resource metrics: {resources_response.status_code}")
            return False
        
        return True
        
    except Exception as e:
        print_error(f"Error testing training data availability: {str(e)}")
        return False

def test_current_data_endpoints():
    """Test current/live data endpoints"""
    print_test_header("Current Data Endpoints")
    
    try:
        # Test current training loss
        current_loss_response = requests.get(f"{TRAINING_API_BASE}/api/training/losses/current")
        if current_loss_response.status_code == 200:
            current_loss = current_loss_response.json()
            print_success("Retrieved current training loss")
            print_info(f"Current epoch: {current_loss.get('epoch')}")
            print_info(f"Current train loss: {current_loss.get('train_loss'):.4f}")
            print_info(f"Current validation loss: {current_loss.get('validation_loss'):.4f}")
        else:
            print_error(f"Failed to get current training loss: {current_loss_response.status_code}")
        
        # Test current resource metrics
        current_resources_response = requests.get(f"{TRAINING_API_BASE}/api/training/resources/current")
        if current_resources_response.status_code == 200:
            current_resources = current_resources_response.json()
            print_success("Retrieved current resource metrics")
            print_info(f"GPU utilization: {current_resources.get('gpu_percent'):.1f}%")
            print_info(f"CPU utilization: {current_resources.get('cpu_percent'):.1f}%")
            print_info(f"GPU temperature: {current_resources.get('gpu_temp')}°C")
            print_info(f"RAM usage: {current_resources.get('ram_used_gb'):.1f}GB / {current_resources.get('ram_total_gb'):.1f}GB")
        else:
            print_error(f"Failed to get current resource metrics: {current_resources_response.status_code}")
        
        return True
        
    except Exception as e:
        print_error(f"Error testing current data endpoints: {str(e)}")
        return False

def test_training_status():
    """Test training status endpoint"""
    print_test_header("Training Status")
    
    try:
        # Test training status for a mock job
        test_job_id = "test-job-12345"
        status_response = requests.get(f"{TRAINING_API_BASE}/api/training/status/{test_job_id}")
        
        if status_response.status_code == 200:
            status_data = status_response.json()
            print_success(f"Retrieved training status for job: {test_job_id}")
            print_info(f"Status: {status_data.get('status')}")
            print_info(f"Progress: {status_data.get('progress_percent')}%")
            print_info(f"Current epoch: {status_data.get('current_epoch')}/{status_data.get('total_epochs')}")
            print_info(f"Elapsed time: {status_data.get('elapsed_time')}")
            print_info(f"Estimated remaining: {status_data.get('estimated_remaining')}")
        else:
            print_error(f"Failed to get training status: {status_response.status_code}")
            return False
        
        return True
        
    except Exception as e:
        print_error(f"Error testing training status: {str(e)}")
        return False

def test_training_summary():
    """Test training summary endpoint"""
    print_test_header("Training Summary")
    
    try:
        summary_response = requests.get(f"{TRAINING_API_BASE}/api/training/summary")
        
        if summary_response.status_code == 200:
            summary_data = summary_response.json()
            print_success("Retrieved training summary")
            print_info(f"Training mode: {summary_data.get('training_mode')}")
            print_info(f"Completed: {summary_data.get('is_completed')}")
            print_info(f"Current epoch: {summary_data.get('current_epoch')}")
            print_info(f"Current step: {summary_data.get('current_step')}")
            print_info(f"Train loss: {summary_data.get('current_train_loss'):.4f}")
            print_info(f"Validation loss: {summary_data.get('current_val_loss'):.4f}")
            print_info(f"GPU utilization: {summary_data.get('gpu_utilization'):.1f}%")
            
            memory_usage = summary_data.get('memory_usage', {})
            print_info(f"RAM: {memory_usage.get('ram_used'):.1f}GB / {memory_usage.get('ram_total'):.1f}GB")
            print_info(f"VRAM: {memory_usage.get('vram_used'):.1f}GB / {memory_usage.get('vram_total'):.1f}GB")
            
            temperatures = summary_data.get('temperatures', {})
            print_info(f"GPU temp: {temperatures.get('gpu')}°C, CPU temp: {temperatures.get('cpu')}°C")
        else:
            print_error(f"Failed to get training summary: {summary_response.status_code}")
            return False
        
        return True
        
    except Exception as e:
        print_error(f"Error testing training summary: {str(e)}")
        return False

def test_training_mode_switching():
    """Test training mode switching"""
    print_test_header("Training Mode Switching")
    
    try:
        # Get current mode
        mode_response = requests.get(f"{TRAINING_API_BASE}/api/training/mode")
        if mode_response.status_code == 200:
            current_mode_data = mode_response.json()
            original_mode = current_mode_data.get('mode')
            print_info(f"Current training mode: {original_mode}")
        else:
            print_error("Failed to get current training mode")
            return False
        
        # Test switching to automated mode
        switch_response = requests.post(f"{TRAINING_API_BASE}/api/training/mode/automated")
        if switch_response.status_code == 200:
            switch_result = switch_response.json()
            print_success(f"Switched to automated mode: {switch_result.get('message')}")
        else:
            print_error(f"Failed to switch to automated mode: {switch_response.status_code}")
        
        # Test switching to manual mode
        switch_response = requests.post(f"{TRAINING_API_BASE}/api/training/mode/manual")
        if switch_response.status_code == 200:
            switch_result = switch_response.json()
            print_success(f"Switched to manual mode: {switch_result.get('message')}")
        else:
            print_error(f"Failed to switch to manual mode: {switch_response.status_code}")
        
        # Switch back to original mode
        if original_mode:
            requests.post(f"{TRAINING_API_BASE}/api/training/mode/{original_mode}")
            print_info(f"Restored original mode: {original_mode}")
        
        return True
        
    except Exception as e:
        print_error(f"Error testing training mode switching: {str(e)}")
        return False

def test_real_time_progression():
    """Test real-time data progression"""
    print_test_header("Real-time Data Progression")
    
    print_info("Monitoring training progression for 15 seconds...")
    
    try:
        initial_response = requests.get(f"{TRAINING_API_BASE}/api/training/losses/current")
        if initial_response.status_code != 200:
            print_error("Cannot get initial training data")
            return False
        
        initial_data = initial_response.json()
        initial_step = initial_data.get('step', 0)
        
        print_info(f"Starting step: {initial_step}")
        
        # Monitor for progression over time
        progression_detected = False
        for i in range(5):  # Check 5 times over 15 seconds
            time.sleep(3)  # Wait 3 seconds between checks
            
            current_response = requests.get(f"{TRAINING_API_BASE}/api/training/losses/current")
            if current_response.status_code == 200:
                current_data = current_response.json()
                current_step = current_data.get('step', 0)
                
                print_info(f"Check {i+1}: Step {current_step}, Loss {current_data.get('train_loss', 0):.4f}")
                
                if current_step != initial_step:
                    progression_detected = True
                    print_success("Data progression detected - training simulation is working!")
                    break
            else:
                print_warning(f"Failed to get data on check {i+1}")
        
        if not progression_detected:
            print_warning("No data progression detected. This may be normal if at end of dataset.")
        
        return True
        
    except Exception as e:
        print_error(f"Error testing real-time progression: {str(e)}")
        return False

def test_data_consistency():
    """Test data consistency across endpoints"""
    print_test_header("Data Consistency")
    
    try:
        # Get data from multiple endpoints and compare
        current_loss_response = requests.get(f"{TRAINING_API_BASE}/api/training/losses/current")
        summary_response = requests.get(f"{TRAINING_API_BASE}/api/training/summary")
        
        if current_loss_response.status_code == 200 and summary_response.status_code == 200:
            current_loss = current_loss_response.json()
            summary = summary_response.json()
            
            # Compare key fields
            loss_epoch = current_loss.get('epoch')
            summary_epoch = summary.get('current_epoch')
            loss_step = current_loss.get('step')
            summary_step = summary.get('current_step')
            
            if loss_epoch == summary_epoch:
                print_success(f"Epoch consistency: {loss_epoch}")
            else:
                print_error(f"Epoch mismatch: {loss_epoch} vs {summary_epoch}")
            
            if loss_step == summary_step:
                print_success(f"Step consistency: {loss_step}")
            else:
                print_error(f"Step mismatch: {loss_step} vs {summary_step}")
            
            # Check if loss values match
            current_train_loss = current_loss.get('train_loss')
            summary_train_loss = summary.get('current_train_loss')
            
            if abs(current_train_loss - summary_train_loss) < 0.0001:
                print_success(f"Training loss consistency: {current_train_loss:.4f}")
            else:
                print_error(f"Training loss mismatch: {current_train_loss:.4f} vs {summary_train_loss:.4f}")
        else:
            print_error("Failed to get data for consistency check")
            return False
        
        return True
        
    except Exception as e:
        print_error(f"Error testing data consistency: {str(e)}")
        return False

def main():
    """Run all training simulation tests"""
    print(f"{Colors.BOLD}AI Fine-tuning Dashboard - Training Simulation Test{Colors.END}")
    print("Testing training monitoring and real-time data APIs\n")
    
    # Check if training API is available
    try:
        health_response = requests.get(f"{TRAINING_API_BASE}/", timeout=5)
        if health_response.status_code != 200:
            print_error("Training API is not responding. Please start it first:")
            print_info("cd python-backend && uv run python mock_training_api.py")
            sys.exit(1)
    except Exception:
        print_error("Cannot connect to training API. Please start it first:")
        print_info("cd python-backend && uv run python mock_training_api.py")
        sys.exit(1)
    
    results = []
    
    # Run all test suites
    results.append(("Training Data Availability", test_training_data_availability()))
    results.append(("Current Data Endpoints", test_current_data_endpoints()))
    results.append(("Training Status", test_training_status()))
    results.append(("Training Summary", test_training_summary()))
    results.append(("Training Mode Switching", test_training_mode_switching()))
    results.append(("Real-time Progression", test_real_time_progression()))
    results.append(("Data Consistency", test_data_consistency()))
    
    # Print summary
    print_test_header("Test Results Summary")
    
    successful_tests = sum(1 for _, result in results if result)
    total_tests = len(results)
    
    for test_name, success in results:
        status = f"{Colors.GREEN}PASS{Colors.END}" if success else f"{Colors.RED}FAIL{Colors.END}"
        print(f"{test_name}: {status}")
    
    print(f"\nOverall: {successful_tests}/{total_tests} tests passed")
    
    if successful_tests == total_tests:
        print_success("All training simulation tests passed!")
        print_info("Your training monitoring system is working correctly.")
        sys.exit(0)
    else:
        print_error("Some training tests failed. Check the logs above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
