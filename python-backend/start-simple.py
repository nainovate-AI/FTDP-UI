#!/usr/bin/env python3
"""
Simple Backend Startup Script for Nainovate AI

This script provides a more reliable way to start the backend services
by handling common uv and virtual environment issues.
"""

import subprocess
import sys
import os
import time
import threading
from pathlib import Path

def check_python_and_uv():
    """Check if Python and uv are available"""
    print("🔍 Checking Python and uv availability...")
    
    # Check Python
    try:
        result = subprocess.run([sys.executable, "--version"], capture_output=True, text=True)
        print(f"✅ Python found: {result.stdout.strip()}")
    except Exception as e:
        print(f"❌ Python check failed: {e}")
        sys.exit(1)
    
    # Check uv
    try:
        result = subprocess.run(["uv", "--version"], capture_output=True, text=True)
        print(f"✅ uv found: {result.stdout.strip()}")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("⚠️  uv not found, will use pip instead")
        return False

def setup_with_pip():
    """Setup environment using pip if uv fails"""
    print("🔄 Setting up environment with pip...")
    
    # Install dependencies directly
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        print("✅ Dependencies installed with pip")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies with pip: {e}")
        return False

def setup_with_uv():
    """Setup environment using uv"""
    print("🔄 Setting up environment with uv...")
    
    # Remove problematic .venv if it exists
    venv_path = Path(".venv")
    if venv_path.exists():
        pyvenv_cfg = venv_path / "pyvenv.cfg"
        if not pyvenv_cfg.exists():
            print("🗑️  Removing corrupted virtual environment...")
            import shutil
            try:
                shutil.rmtree(venv_path)
                print("✅ Removed corrupted virtual environment")
            except Exception as e:
                print(f"⚠️  Could not remove corrupted venv: {e}")
    
    # Use uv sync if pyproject.toml exists
    if Path("pyproject.toml").exists():
        try:
            subprocess.run(["uv", "sync"], check=True)
            print("✅ Environment synced with uv")
            return True
        except subprocess.CalledProcessError as e:
            print(f"⚠️  uv sync failed: {e}")
    
    # Fallback to manual venv creation and pip install
    try:
        subprocess.run(["uv", "venv", ".venv"], check=True)
        subprocess.run(["uv", "pip", "install", "-r", "requirements.txt"], check=True)
        print("✅ Environment setup with uv completed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"⚠️  uv setup failed: {e}")
        return False

def start_with_python():
    """Start servers using direct Python execution"""
    print("🚀 Starting servers with direct Python execution...")
    
    def start_main_api():
        try:
            subprocess.run([sys.executable, "-m", "uvicorn", "main:app", 
                          "--host", "127.0.0.1", "--port", "8000", "--reload"], check=True)
        except Exception as e:
            print(f"❌ Main API failed: {e}")
    
    def start_mock_api():
        try:
            subprocess.run([sys.executable, "-m", "uvicorn", "mock_training_api:app", 
                          "--host", "0.0.0.0", "--port", "8001", "--reload"], check=True)
        except Exception as e:
            print(f"❌ Mock API failed: {e}")
    
    try:
        # Start main API in background thread
        main_thread = threading.Thread(target=start_main_api, daemon=True)
        main_thread.start()
        
        time.sleep(2)  # Give main API time to start
        
        # Start mock API in foreground
        start_mock_api()
        
    except KeyboardInterrupt:
        print("\n🛑 Servers stopped by user")

def start_with_uv():
    """Start servers using uv run"""
    print("🚀 Starting servers with uv run...")
    
    def start_main_api():
        try:
            subprocess.run(["uv", "run", "--project", ".", "uvicorn", "main:app", 
                          "--host", "127.0.0.1", "--port", "8000", "--reload"], check=True)
        except Exception as e:
            print(f"❌ Main API failed: {e}")
    
    def start_mock_api():
        try:
            subprocess.run(["uv", "run", "--project", ".", "uvicorn", "mock_training_api:app", 
                          "--host", "0.0.0.0", "--port", "8001", "--reload"], check=True)
        except Exception as e:
            print(f"❌ Mock API failed: {e}")
    
    try:
        # Start main API in background thread
        main_thread = threading.Thread(target=start_main_api, daemon=True)
        main_thread.start()
        
        time.sleep(2)  # Give main API time to start
        
        # Start mock API in foreground
        start_mock_api()
        
    except KeyboardInterrupt:
        print("\n🛑 Servers stopped by user")

def main():
    """Main function with multiple fallback strategies"""
    print("🎯 Nainovate AI Backend Startup")
    print("=" * 40)
    
    # Change to script directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # Check if required files exist
    if not Path("requirements.txt").exists() and not Path("pyproject.toml").exists():
        print("❌ No requirements.txt or pyproject.toml found!")
        sys.exit(1)
    
    if not Path("main.py").exists():
        print("❌ main.py not found!")
        sys.exit(1)
    
    if not Path("mock_training_api.py").exists():
        print("❌ mock_training_api.py not found!")
        sys.exit(1)
    
    # Check tools availability
    has_uv = check_python_and_uv()
    
    print("\n📋 Server Information:")
    print("📍 Job Management API: http://127.0.0.1:8000")
    print("📍 Mock Training API: http://127.0.0.1:8001")
    print("📚 API Docs: http://127.0.0.1:8000/docs")
    print("🩺 Health Check: http://127.0.0.1:8000/api/health")
    print("\n🛑 Press Ctrl+C to stop servers\n")
    
    # Try different startup strategies
    if has_uv:
        print("🔄 Attempting startup with uv...")
        if setup_with_uv():
            start_with_uv()
        else:
            print("🔄 uv setup failed, falling back to pip...")
            if setup_with_pip():
                start_with_python()
            else:
                print("❌ All setup methods failed!")
                sys.exit(1)
    else:
        print("🔄 Using pip-based setup...")
        if setup_with_pip():
            start_with_python()
        else:
            print("❌ Pip setup failed!")
            sys.exit(1)

if __name__ == "__main__":
    main()
