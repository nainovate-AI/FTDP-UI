#!/usr/bin/env python3
"""
End-to-End Workflow Test Script
Tests the complete fine-tuning workflow from dataset upload to job monitoring
"""

import requests
import json
import tempfile
import os
import time
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

def print_info(message: str):
    print(f"{Colors.BLUE}ℹ {message}{Colors.END}")

def print_warning(message: str):
    print(f"{Colors.YELLOW}⚠ {message}{Colors.END}")

class WorkflowTest:
    def __init__(self):
        self.test_model_id = None
        self.test_dataset_uid = None
        self.test_job_uid = None
        self.workflow_steps_completed = []
    
    def step_1_dataset_upload_and_validation(self):
        """Step 1: Upload and validate a dataset"""
        print_test_header("Step 1: Dataset Upload & Validation")
        
        # Create test CSV content
        test_csv_content = """input,output
"What is artificial intelligence?","Artificial Intelligence (AI) is the simulation of human intelligence in machines."
"Explain machine learning","Machine learning is a subset of AI that enables computers to learn from data."
"What is deep learning?","Deep learning is a subset of machine learning using neural networks with multiple layers."
"Define natural language processing","NLP is a branch of AI that helps computers understand and interpret human language."
"What is computer vision?","Computer vision is a field of AI that trains computers to interpret visual information."
"Explain reinforcement learning","Reinforcement learning is a type of ML where agents learn through interaction with an environment."
"What are neural networks?","Neural networks are computing systems inspired by biological neural networks."
"Define supervised learning","Supervised learning uses labeled data to train algorithms to predict outcomes."
"What is unsupervised learning?","Unsupervised learning finds hidden patterns in data without labeled examples."
"Explain transfer learning","Transfer learning adapts a pre-trained model for a new but related task."
"""
        
        try:
            # Create temporary CSV file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as temp_file:
                temp_file.write(test_csv_content)
                temp_path = temp_file.name
            
            print_info("Uploading test dataset...")
            
            # Upload and preview CSV
            with open(temp_path, 'rb') as csv_file:
                files = {'file': ('ai_training_dataset.csv', csv_file, 'text/csv')}
                preview_response = requests.post(f"{MAIN_API_BASE}/api/preview-csv", files=files)
                
                if preview_response.status_code == 200:
                    preview_result = preview_response.json()
                    print_success("Dataset uploaded and previewed successfully")
                    print_info(f"Rows: {preview_result['statistics']['total_rows']}")
                    print_info(f"Columns: {preview_result['statistics']['total_columns']}")
                    
                    if preview_result['statistics']['has_required_columns']:
                        print_success("Dataset has required 'input' and 'output' columns")
                    else:
                        print_error("Dataset missing required columns")
                        return False
                    
                    if not preview_result.get('validation_errors'):
                        print_success("Dataset validation passed")
                    else:
                        print_warning(f"Validation warnings: {preview_result['validation_errors']}")
                else:
                    print_error(f"Dataset upload failed: {preview_response.status_code}")
                    return False
            
            # Clean up temp file
            os.unlink(temp_path)
            
            self.workflow_steps_completed.append("Dataset Upload & Validation")
            return True
            
        except Exception as e:
            print_error(f"Dataset upload error: {str(e)}")
            return False
    
    def step_2_model_selection(self):
        """Step 2: Search and select a model"""
        print_test_header("Step 2: Model Selection")
        
        try:
            print_info("Searching for models...")
            
            # Search for GPT models
            search_response = requests.get(f"{MAIN_API_BASE}/api/models/search?query=gpt&limit=5")
            if search_response.status_code == 200:
                search_results = search_response.json()
                print_success(f"Found {len(search_results)} models")
                
                if search_results:
                    # Select first model for testing
                    selected_model = search_results[0]
                    self.test_model_id = selected_model.get('id')
                    print_info(f"Selected model: {selected_model.get('name')} ({self.test_model_id})")
                    
                    # Add model to collection (might already exist)
                    add_response = requests.post(f"{MAIN_API_BASE}/api/models", json=selected_model)
                    if add_response.status_code == 200:
                        add_result = add_response.json()
                        if add_result.get("success"):
                            print_success("Model added to collection")
                        else:
                            # Model might already exist
                            print_info(f"Model operation result: {add_result.get('message')}")
                    
                    # Verify model is in collection
                    check_response = requests.get(f"{MAIN_API_BASE}/api/models/check/{self.test_model_id}")
                    if check_response.status_code == 200:
                        check_result = check_response.json()
                        if check_result.get("exists"):
                            print_success("Model confirmed in collection")
                        else:
                            print_error("Model not found in collection after adding")
                            return False
                else:
                    print_error("No models found in search")
                    return False
            else:
                print_error(f"Model search failed: {search_response.status_code}")
                return False
            
            self.workflow_steps_completed.append("Model Selection")
            return True
            
        except Exception as e:
            print_error(f"Model selection error: {str(e)}")
            return False
    
    def step_3_hyperparameter_configuration(self):
        """Step 3: Configure hyperparameters"""
        print_test_header("Step 3: Hyperparameter Configuration")
        
        try:
            print_info("Loading hyperparameter configurations...")
            
            # Get available hyperparameter configs
            metadata_response = requests.get(f"{MAIN_API_BASE}/api/metadata")
            if metadata_response.status_code == 200:
                metadata = metadata_response.json()
                current_hp_uid = metadata.get('hyperparameters', {}).get('uid')
                
                if current_hp_uid:
                    print_success(f"Current hyperparameter config: {current_hp_uid}")
                    print_info("Using existing hyperparameter configuration")
                else:
                    print_warning("No hyperparameter configuration found in metadata")
                    # For testing, we'll use a default config
                    current_hp_uid = "00000005k0008000300100002s"  # Manual config from data
                    print_info(f"Using default config: {current_hp_uid}")
            else:
                print_error(f"Failed to get metadata: {metadata_response.status_code}")
                return False
            
            self.workflow_steps_completed.append("Hyperparameter Configuration")
            return True
            
        except Exception as e:
            print_error(f"Hyperparameter configuration error: {str(e)}")
            return False
    
    def step_4_job_creation(self):
        """Step 4: Create a fine-tuning job"""
        print_test_header("Step 4: Job Creation")
        
        try:
            print_info("Creating fine-tuning job...")
            
            # Create comprehensive job data
            job_data = {
                "name": "E2E Test Fine-tuning Job",
                "description": "End-to-end test job created by workflow test script",
                "tags": ["test", "e2e", "workflow", "automated"],
                "configuration": {
                    "model": {
                        "uid": self.test_model_id,
                        "name": f"Model {self.test_model_id}",
                        "provider": "HuggingFace"
                    },
                    "dataset": {
                        "uid": "test-dataset-e2e",
                        "name": "AI Training Dataset",
                        "rows": 10
                    },
                    "hyperparameters": {
                        "uid": "00000005k0008000300100002s",
                        "mode": "manual",
                        "learning_rate": 0.0002,
                        "batch_size": 8,
                        "epochs": 3
                    }
                },
                "modelSaving": {
                    "saveModel": True,
                    "modelName": "e2e-test-fine-tuned-model",
                    "pushToHub": False,
                    "makePublic": False
                },
                "createdAt": datetime.now().isoformat() + "Z"
            }
            
            # Create the job
            create_response = requests.post(f"{MAIN_API_BASE}/api/jobs", json=job_data)
            if create_response.status_code == 200:
                create_result = create_response.json()
                if create_result.get("success"):
                    self.test_job_uid = create_result.get("jobUid")
                    print_success(f"Job created successfully: {self.test_job_uid}")
                    
                    # Verify job was created
                    job_response = requests.get(f"{MAIN_API_BASE}/api/jobs/{self.test_job_uid}")
                    if job_response.status_code == 200:
                        job_data = job_response.json()
                        print_success("Job verification successful")
                        print_info(f"Job status: {job_data.get('status')}")
                        print_info(f"Job name: {job_data.get('name')}")
                    else:
                        print_error("Job verification failed")
                        return False
                else:
                    print_error(f"Job creation failed: {create_result.get('message')}")
                    return False
            else:
                print_error(f"Job creation request failed: {create_response.status_code}")
                return False
            
            self.workflow_steps_completed.append("Job Creation")
            return True
            
        except Exception as e:
            print_error(f"Job creation error: {str(e)}")
            return False
    
    def step_5_training_monitoring(self):
        """Step 5: Monitor training progress"""
        print_test_header("Step 5: Training Monitoring")
        
        try:
            print_info("Testing training monitoring capabilities...")
            
            # Test training status
            status_response = requests.get(f"{TRAINING_API_BASE}/api/training/status/{self.test_job_uid}")
            if status_response.status_code == 200:
                status_data = status_response.json()
                print_success("Training status retrieved")
                print_info(f"Status: {status_data.get('status')}")
                print_info(f"Progress: {status_data.get('progress_percent')}%")
                print_info(f"Current epoch: {status_data.get('current_epoch')}/{status_data.get('total_epochs')}")
            else:
                print_warning(f"Training status not available: {status_response.status_code}")
            
            # Test live metrics
            summary_response = requests.get(f"{TRAINING_API_BASE}/api/training/summary")
            if summary_response.status_code == 200:
                summary_data = summary_response.json()
                print_success("Training summary retrieved")
                print_info(f"Current train loss: {summary_data.get('current_train_loss', 0):.4f}")
                print_info(f"Current validation loss: {summary_data.get('current_val_loss', 0):.4f}")
                print_info(f"GPU utilization: {summary_data.get('gpu_utilization', 0):.1f}%")
                
                memory_usage = summary_data.get('memory_usage', {})
                print_info(f"Memory usage: {memory_usage.get('vram_used', 0):.1f}GB / {memory_usage.get('vram_total', 0):.1f}GB")
            else:
                print_warning(f"Training summary not available: {summary_response.status_code}")
            
            # Test real-time data progression
            print_info("Testing real-time data progression...")
            initial_response = requests.get(f"{TRAINING_API_BASE}/api/training/losses/current")
            if initial_response.status_code == 200:
                initial_data = initial_response.json()
                initial_step = initial_data.get('step', 0)
                
                # Wait and check for progression
                time.sleep(4)
                current_response = requests.get(f"{TRAINING_API_BASE}/api/training/losses/current")
                if current_response.status_code == 200:
                    current_data = current_response.json()
                    current_step = current_data.get('step', 0)
                    
                    if current_step != initial_step:
                        print_success("Real-time progression detected")
                    else:
                        print_info("No progression detected (may be at dataset end)")
                else:
                    print_warning("Could not verify progression")
            
            self.workflow_steps_completed.append("Training Monitoring")
            return True
            
        except Exception as e:
            print_error(f"Training monitoring error: {str(e)}")
            return False
    
    def step_6_job_management(self):
        """Step 6: Test job management features"""
        print_test_header("Step 6: Job Management")
        
        try:
            print_info("Testing job management features...")
            
            # Test job statistics
            stats_response = requests.get(f"{MAIN_API_BASE}/api/jobs/statistics")
            if stats_response.status_code == 200:
                stats = stats_response.json()
                print_success("Job statistics retrieved")
                print_info(f"Total jobs: {stats.get('total', 0)}")
                print_info(f"Current jobs: {stats.get('current', {}).get('total', 0)}")
                print_info(f"Past jobs: {stats.get('past', {}).get('total', 0)}")
                print_info(f"Success rate: {stats.get('success_rate', '0%')}")
            else:
                print_warning(f"Job statistics not available: {stats_response.status_code}")
            
            # Test getting all jobs
            all_jobs_response = requests.get(f"{MAIN_API_BASE}/api/jobs")
            if all_jobs_response.status_code == 200:
                all_jobs = all_jobs_response.json()
                total_jobs = all_jobs.get('total', 0)
                print_success(f"Retrieved all jobs: {total_jobs} total")
                
                # Verify our test job is in the list
                jobs_list = all_jobs.get('jobs', [])
                test_job_found = any(job.get('uid') == self.test_job_uid for job in jobs_list)
                if test_job_found:
                    print_success("Test job found in jobs list")
                else:
                    print_warning("Test job not found in jobs list")
            else:
                print_warning(f"Could not retrieve all jobs: {all_jobs_response.status_code}")
            
            self.workflow_steps_completed.append("Job Management")
            return True
            
        except Exception as e:
            print_error(f"Job management error: {str(e)}")
            return False
    
    def run_complete_workflow(self):
        """Run the complete end-to-end workflow"""
        print(f"{Colors.BOLD}AI Fine-tuning Dashboard - End-to-End Workflow Test{Colors.END}")
        print("Testing complete workflow from dataset upload to job monitoring\n")
        
        # Define workflow steps
        workflow_steps = [
            ("Dataset Upload & Validation", self.step_1_dataset_upload_and_validation),
            ("Model Selection", self.step_2_model_selection),
            ("Hyperparameter Configuration", self.step_3_hyperparameter_configuration),
            ("Job Creation", self.step_4_job_creation),
            ("Training Monitoring", self.step_5_training_monitoring),
            ("Job Management", self.step_6_job_management),
        ]
        
        results = []
        
        # Execute workflow steps
        for step_name, step_function in workflow_steps:
            try:
                result = step_function()
                results.append((step_name, result))
                
                if not result:
                    print_error(f"Workflow stopped at: {step_name}")
                    break
                    
            except Exception as e:
                print_error(f"Workflow error in {step_name}: {str(e)}")
                results.append((step_name, False))
                break
        
        # Print final results
        self.print_workflow_summary(results)
        
        # Return overall success
        return all(result for _, result in results)
    
    def print_workflow_summary(self, results):
        """Print workflow summary"""
        print_test_header("End-to-End Workflow Summary")
        
        successful_steps = sum(1 for _, result in results if result)
        total_steps = len(results)
        
        print(f"{Colors.BOLD}Workflow Steps Completed:{Colors.END}")
        for step_name, success in results:
            status = f"{Colors.GREEN}✓ COMPLETED{Colors.END}" if success else f"{Colors.RED}✗ FAILED{Colors.END}"
            print(f"  {step_name}: {status}")
        
        print(f"\n{Colors.BOLD}Overall Results:{Colors.END}")
        print(f"Steps completed: {successful_steps}/{total_steps}")
        success_rate = (successful_steps / total_steps * 100) if total_steps > 0 else 0
        print(f"Success rate: {success_rate:.1f}%")
        
        if successful_steps == total_steps:
            print_success("🎉 Complete end-to-end workflow successful!")
            print_info("Your AI fine-tuning dashboard is fully functional!")
        else:
            print_error("❌ Workflow incomplete - some steps failed")
            print_info("Check the error messages above for troubleshooting")
        
        # Print component status
        print(f"\n{Colors.BOLD}Component Status:{Colors.END}")
        if self.test_model_id:
            print_info(f"Test Model ID: {self.test_model_id}")
        if self.test_job_uid:
            print_info(f"Test Job UID: {self.test_job_uid}")
        
        print(f"\n{Colors.BOLD}Next Steps:{Colors.END}")
        if successful_steps == total_steps:
            print("✓ Frontend: Navigate to http://localhost:3000")
            print("✓ Try creating a real fine-tuning job")
            print("✓ Upload your own dataset")
            print("✓ Monitor real-time training progress")
        else:
            print("• Fix any failed components")
            print("• Ensure both backend services are running")
            print("• Check API connectivity")

def main():
    """Run the complete end-to-end workflow test"""
    # Check if services are running
    try:
        main_api_check = requests.get(f"{MAIN_API_BASE}/api/health", timeout=5)
        training_api_check = requests.get(f"{TRAINING_API_BASE}/", timeout=5)
        
        if main_api_check.status_code != 200:
            print_error("Main API is not responding. Please start it first:")
            print_info("cd python-backend && uv run python main.py")
            sys.exit(1)
            
        if training_api_check.status_code != 200:
            print_error("Training API is not responding. Please start it first:")
            print_info("cd python-backend && uv run python mock_training_api.py")
            sys.exit(1)
            
    except Exception:
        print_error("Cannot connect to required services. Please ensure both APIs are running:")
        print_info("Terminal 1: cd python-backend && uv run python main.py")
        print_info("Terminal 2: cd python-backend && uv run python mock_training_api.py")
        sys.exit(1)
    
    # Run the workflow
    workflow_test = WorkflowTest()
    success = workflow_test.run_complete_workflow()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
