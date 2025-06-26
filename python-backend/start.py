#!/usr/bin/env python3
"""
FastAPI CSV Preview Server Startup Script

This script initializes the FastAPI server for CSV file preview functionality.
It handles dependency installation and server startup using uv.
"""

import subprocess
import sys
import os
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

def start_server():
    """Start the FastAPI server"""
    print("🌟 Starting FastAPI server...")
    print("📍 Server will be available at: http://127.0.0.1:8000")
    print("📋 API documentation: http://127.0.0.1:8000/docs")
    print("🔗 Health check: http://127.0.0.1:8000/api/health")
    print("\n🛑 Press Ctrl+C to stop the server\n")
    
    try:
        # Start server using uv
        subprocess.run([
            "uv", "run", "uvicorn", "main:app",
            "--host", "127.0.0.1",
            "--port", "8000",
            "--reload",
            "--log-level", "info"
        ], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Server failed to start: {e}")
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
    start_server()

if __name__ == "__main__":
    main()
