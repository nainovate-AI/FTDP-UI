#!/usr/bin/env python3
"""
Nainovate AI Backend Startup Script

This script initializes both FastAPI servers:
- Job Management API (port 8000)
- Mock Training API (port 8001)
It handles dependency installation and server startup using uv.
"""

import subprocess
import sys
import os
import time
import threading
from pathlib import Path

def setup_environment():
    """Set up Python environment using uv"""
    print("🚀 Setting up Python environment...")
    
    # Check if uv is installed
    try:
        subprocess.run(["uv", "--version"], check=True, capture_output=True)
        print("✅ uv is available")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ uv is not installed. Please install uv first:")
        print("   pip install uv")
        sys.exit(1)
    
    # Create virtual environment
    print("📦 Creating virtual environment...")
    try:
        subprocess.run(["uv", "venv", "--python", "3.11"], check=True)
        print("✅ Virtual environment created")
    except subprocess.CalledProcessError as e:
        print(f"⚠️  Virtual environment creation failed (may already exist): {e}")
    
    # Install dependencies
    print("📥 Installing dependencies...")
    try:
        subprocess.run(["uv", "pip", "install", "-r", "requirements.txt"], check=True)
        print("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        sys.exit(1)

def start_job_management_api():
    """Start the Job Management API (port 8000)"""
    print("🌟 Starting Job Management API...")
    try:
        subprocess.run([
            "uv", "run", "uvicorn", "main:app",
            "--host", "127.0.0.1",
            "--port", "8000",
            "--reload",
            "--log-level", "info"
        ], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Job Management API stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Job Management API failed to start: {e}")

def start_mock_training_api():
    """Start the Mock Training API (port 8001)"""
    print("🌟 Starting Mock Training API...")
    try:
        subprocess.run([
            "uv", "run", "uvicorn", "mock_training_api:app",
            "--host", "0.0.0.0",
            "--port", "8001",
            "--reload",
            "--log-level", "info"
        ], check=True)
    except KeyboardInterrupt:
        print("\n� Mock Training API stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Mock Training API failed to start: {e}")

def start_servers():
    """Start both servers in separate threads"""
    print("🌟 Starting both API servers...")
    print("📍 Job Management API: http://127.0.0.1:8000")
    print("📍 Mock Training API: http://127.0.0.1:8001")
    print("📋 API documentation:")
    print("   • Job Management: http://127.0.0.1:8000/docs")
    print("   • Mock Training: http://127.0.0.1:8001/docs")
    print("🔗 Health checks:")
    print("   • Job Management: http://127.0.0.1:8000/api/health")
    print("   • Mock Training: http://127.0.0.1:8001/")
    print("\n🛑 Press Ctrl+C to stop both servers\n")
    
    try:
        # Start Job Management API in a separate thread
        job_thread = threading.Thread(target=start_job_management_api, daemon=True)
        job_thread.start()
        
        # Wait a moment for the first service to initialize
        time.sleep(3)
        
        # Start Mock Training API in the main thread
        start_mock_training_api()
        
    except KeyboardInterrupt:
        print("\n🛑 Both servers stopped by user")
    except Exception as e:
        print(f"❌ Failed to start servers: {e}")
        sys.exit(1)

def main():
    """Main function"""
    print("🎯 FastAPI CSV Preview Server")
    print("=" * 40)
    
    # Change to script directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # Setup and start
    setup_environment()
    start_servers()

if __name__ == "__main__":
    main()
