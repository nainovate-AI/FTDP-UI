#!/usr/bin/env python3
"""
Finetuning Dashboard - Setup Menu
AI Model Training Platform
"""

import os
import sys
import subprocess
import time
import shutil
from pathlib import Path

try:
    from colorama import init, Fore, Back, Style
    init(autoreset=True)
except ImportError:
    print("Installing colorama for color support...")
    subprocess.run([sys.executable, "-m", "pip", "install", "colorama"], check=True)
    from colorama import init, Fore, Back, Style
    init(autoreset=True)


class Colors:
    """Color constants for consistent styling"""
    HEADER = Fore.CYAN + Style.BRIGHT
    SUCCESS = Fore.GREEN + Style.BRIGHT
    WARNING = Fore.YELLOW + Style.BRIGHT
    ERROR = Fore.RED + Style.BRIGHT
    INFO = Fore.BLUE + Style.BRIGHT
    MENU = Fore.WHITE + Style.BRIGHT
    ACCENT = Fore.MAGENTA + Style.BRIGHT
    RESET = Style.RESET_ALL


def clear_screen():
    """Clear the terminal screen"""
    os.system('cls' if os.name == 'nt' else 'clear')


def print_header():
    """Print a simple header with confidentiality statement"""
    print()
    print(Colors.HEADER + "Finetuning Dashboard")
    print(Colors.INFO + "AI Model Training Platform")
    print()
    print(Colors.WARNING + "⚠ CONFIDENTIAL - Proprietary Software")
    print(Colors.RESET + "Unauthorized use or distribution prohibited")
    print()


def print_menu():
    """Print the main menu options"""
    print(Colors.MENU + "Please select an option:")
    print()
    print(Colors.INFO + "1. " + Colors.RESET + "Check dependencies (and install if missing)")
    print(Colors.INFO + "2. " + Colors.RESET + "Start only backend")
    print(Colors.INFO + "3. " + Colors.RESET + "Start only frontend")
    print(Colors.INFO + "4. " + Colors.RESET + "Start both frontend and backend")
    print(Colors.INFO + "5. " + Colors.RESET + "Open documentation")
    print(Colors.INFO + "6. " + Colors.RESET + "Exit")
    print()


def run_command(command, shell=True, capture_output=False):
    """Run a command and return the result"""
    try:
        if capture_output:
            result = subprocess.run(command, shell=shell, capture_output=True, text=True)
            return result.returncode == 0, result.stdout.strip()
        else:
            result = subprocess.run(command, shell=shell)
            return result.returncode == 0, ""
    except Exception as e:
        return False, str(e)


def check_command_exists(command):
    """Check if a command exists"""
    return shutil.which(command) is not None


def print_section_header(title):
    """Print a simple section header"""
    print()
    print(Colors.HEADER + title)
    print()


def check_dependencies():
    """Check and install dependencies"""
    print_section_header("Checking Dependencies")
    
    # Check Node.js
    print(Colors.INFO + "Checking Node.js and npm...")
    if check_command_exists("node"):
        success, version = run_command("node --version", capture_output=True)
        if success:
            print(Colors.SUCCESS + f"✓ Node.js found: {version}")
        else:
            print(Colors.ERROR + "✗ Node.js command failed")
            return False
    else:
        print(Colors.ERROR + "✗ Node.js not found. Please install Node.js 18+ from https://nodejs.org/")
        input(Colors.WARNING + "Press Enter to continue...")
        return False
    
    # Check npm
    if check_command_exists("npm"):
        success, version = run_command("npm --version", capture_output=True)
        if success:
            print(Colors.SUCCESS + f"✓ npm found: {version}")
        else:
            print(Colors.ERROR + "✗ npm command failed")
            return False
    else:
        print(Colors.ERROR + "✗ npm not found. Please install npm.")
        input(Colors.WARNING + "Press Enter to continue...")
        return False
    
    print()
    
    # Check Python
    print(Colors.INFO + "Checking Python and uv...")
    if check_command_exists("python"):
        success, version = run_command("python --version", capture_output=True)
        if success:
            print(Colors.SUCCESS + f"✓ Python found: {version}")
        else:
            print(Colors.ERROR + "✗ Python command failed")
            return False
    else:
        print(Colors.ERROR + "✗ Python not found. Please install Python 3.11+ from https://python.org/")
        input(Colors.WARNING + "Press Enter to continue...")
        return False
    
    # Check uv
    if check_command_exists("uv"):
        success, version = run_command("uv --version", capture_output=True)
        if success:
            print(Colors.SUCCESS + f"✓ uv found: {version}")
        else:
            print(Colors.WARNING + "! uv command exists but failed to get version")
    else:
        print(Colors.WARNING + "! uv not found. Installing uv...")
        success, output = run_command("pip install uv")
        if success:
            print(Colors.SUCCESS + "✓ uv installed successfully")
        else:
            print(Colors.ERROR + "✗ Failed to install uv. Please install manually: pip install uv")
            input(Colors.WARNING + "Press Enter to continue...")
            return False
    
    print()
    
    # Install npm dependencies
    print(Colors.INFO + "Installing npm dependencies...")
    success, output = run_command("npm install")
    if success:
        print(Colors.SUCCESS + "✓ npm dependencies installed successfully")
    else:
        print(Colors.ERROR + "✗ Failed to install npm dependencies")
        input(Colors.WARNING + "Press Enter to continue...")
        return False
    
    # Install Python dependencies
    print()
    print(Colors.INFO + "Installing Python dependencies...")
    backend_path = Path("python-backend")
    if backend_path.exists():
        original_dir = os.getcwd()
        os.chdir(backend_path)
        
        # Check if requirements.txt exists
        if Path("requirements.txt").exists():
            print(Colors.INFO + "Installing Python packages from requirements.txt...")
            success, output = run_command("uv pip install -r requirements.txt")
            if success:
                print(Colors.SUCCESS + "✓ Python dependencies installed successfully")
            else:
                print(Colors.ERROR + "✗ Failed to install Python dependencies")
                print(Colors.WARNING + f"Error: {output}")
                os.chdir(original_dir)
                input(Colors.WARNING + "Press Enter to continue...")
                return False
        else:
            print(Colors.WARNING + "! requirements.txt not found in python-backend folder")
        
        os.chdir(original_dir)
    else:
        print(Colors.WARNING + "! python-backend folder not found")
    
    print()
    print(Colors.SUCCESS + "✓ All dependencies checked and installed successfully!")
    print()
    input(Colors.INFO + "Press Enter to continue...")
    return True


def check_and_install_dependencies():
    """Check and install dependencies without full validation"""
    print(Colors.INFO + "Checking and installing dependencies...")
    
    # Install npm dependencies
    print(Colors.INFO + "Installing npm dependencies if needed...")
    success, _ = run_command("npm install")
    if not success:
        print(Colors.ERROR + "✗ Failed to install npm dependencies")
        return False
    
    # Install Python dependencies
    backend_path = Path("python-backend")
    if backend_path.exists():
        original_dir = os.getcwd()
        os.chdir(backend_path)
        
        if Path("requirements.txt").exists():
            print(Colors.INFO + "Installing Python dependencies...")
            success, _ = run_command("uv pip install -r requirements.txt")
            if not success:
                print(Colors.ERROR + "✗ Failed to install Python dependencies")
                os.chdir(original_dir)
                return False
            else:
                print(Colors.SUCCESS + "✓ Python dependencies installed")
        
        os.chdir(original_dir)
    
    print(Colors.SUCCESS + "✓ Dependencies installed successfully")
    return True


def check_and_install_frontend_dependencies():
    """Check and install only frontend dependencies"""
    print(Colors.INFO + "Installing frontend dependencies...")
    
    success, _ = run_command("npm install")
    if not success:
        print(Colors.ERROR + "✗ Failed to install npm dependencies")
        return False
    
    print(Colors.SUCCESS + "✓ Frontend dependencies installed successfully")
    return True


def check_and_install_backend_dependencies():
    """Check and install only backend dependencies"""
    print(Colors.INFO + "Installing backend dependencies...")
    
    backend_path = Path("python-backend")
    if backend_path.exists():
        original_dir = os.getcwd()
        os.chdir(backend_path)
        
        if Path("requirements.txt").exists():
            print(Colors.INFO + "Installing Python dependencies...")
            success, _ = run_command("uv pip install -r requirements.txt")
            if not success:
                print(Colors.ERROR + "✗ Failed to install Python dependencies")
                os.chdir(original_dir)
                return False
            else:
                print(Colors.SUCCESS + "✓ Python dependencies installed")
        
        os.chdir(original_dir)
    else:
        print(Colors.ERROR + "✗ python-backend directory not found")
        return False
    
    print(Colors.SUCCESS + "✓ Backend dependencies installed successfully")
    return True


def start_backend():
    """Start only the backend"""
    print_section_header("Starting Backend Only")
    
    backend_path = Path("python-backend")
    if not backend_path.exists():
        print(Colors.ERROR + "✗ python-backend directory not found!")
        input(Colors.WARNING + "Press Enter to continue...")
        return
    
    os.chdir(backend_path)
    
    try:
        # Use the start-backend.py script which handles everything
        run_command("python start-backend.py", shell=True, capture_output=False)
    except KeyboardInterrupt:
        print(Colors.WARNING + "\nBackend stopped by user.")
    
    os.chdir("..")
    input(Colors.INFO + "Press Enter to continue...")


def start_frontend():
    """Start only the frontend"""
    print_section_header("Starting Frontend Only")
    
    # Check and install frontend dependencies only
    if not check_and_install_frontend_dependencies():
        input(Colors.WARNING + "Press Enter to continue...")
        return
    
    print()
    print(Colors.SUCCESS + "Starting Next.js development server...")
    print(Colors.INFO + "Frontend will be available at " + Colors.ACCENT + "http://localhost:3001")
    print()
    print(Colors.WARNING + "Press Ctrl+C to stop the frontend.")
    print()
    
    try:
        run_command("npm run dev", shell=True, capture_output=False)
    except KeyboardInterrupt:
        print(Colors.WARNING + "\nFrontend stopped by user.")
    
    input(Colors.INFO + "Press Enter to continue...")


def start_both():
    """Start both frontend and backend"""
    print_section_header("Starting Both Frontend and Backend")
    
    # Check and install dependencies first
    if not check_and_install_dependencies():
        input(Colors.WARNING + "Press Enter to continue...")
        return
    
    print(Colors.INFO + "Starting backend in new window...")
    
    # Start backend in a new terminal window
    if os.name == 'nt':  # Windows
        backend_cmd = 'start "AI Dashboard Backend" cmd /k "cd python-backend && python start-backend.py"'
        os.system(backend_cmd)
    else:  # Unix-like systems
        backend_cmd = 'gnome-terminal -- bash -c "cd python-backend && python start-backend.py; exec bash"'
        os.system(backend_cmd)
    
    print(Colors.WARNING + "Waiting 3 seconds for backend to start...")
    time.sleep(3)
    
    print()
    print(Colors.SUCCESS + "Starting frontend...")
    print(Colors.INFO + "Frontend will be available at " + Colors.ACCENT + "http://localhost:3001")
    print()
    print(Colors.WARNING + "Press Ctrl+C to stop the frontend (backend will continue in separate window).")
    print()
    
    try:
        run_command("npm run dev", shell=True, capture_output=False)
    except KeyboardInterrupt:
        print(Colors.WARNING + "\nFrontend stopped by user.")
    
    input(Colors.INFO + "Press Enter to continue...")


def open_docs():
    """Open documentation and show project information"""
    print_section_header("Documentation & Project Information")
    
    # Project Title and Description
    print(Colors.HEADER + "AI Fine-tuning Dashboard")
    print("A modern, React-based platform for managing AI model fine-tuning workflows")
    print("with HuggingFace model integration and real-time dataset processing.")
    print()
    
    # Project Status
    print(Colors.HEADER + "Project Status:")
    print("- Dataset Management - Ready")
    print("- Model Selection - Ready")
    print("- Configuration Setup - Notebook Ready")
    print("- Training Management - Notebook Ready")
    print("- Deployment - Notebook Ready")
    print()
    
    # Installation Steps
    print(Colors.HEADER + "Installation & Setup:")
    print("Prerequisites:")
    print("  • Node.js 18+ and npm")
    print("  • Python 3.11+ with uv package manager")
    print()
    print("Quick Setup (using menu):")
    print("  • Run: python menu.py")
    print("  • Select Option 1: Check dependencies")
    print("  • Select Option 4: Start both services")
    print()
    
    # Tech Stack with Manual Installation
    print(Colors.HEADER + "Tech Stack & Manual Installation:")
    print("  Frontend: Next.js 14, TypeScript, Tailwind CSS")
    print("  Backend: FastAPI, Python 3.11, Pandas, HuggingFace Hub")
    print("  Tools: uv (dependency management), uvicorn (ASGI server)")
    print()
    print("Manual Installation Commands:")
    print("  Frontend:")
    print("    npm install")
    print("    npm run dev")
    print()
    print("  Backend:")
    print("    cd python-backend")
    print("    uv venv --python 3.11")
    print("    uv pip install -r requirements.txt")
    print("    python start-backend.py")
    print()
    
    # Links and Resources
    print(Colors.HEADER + "Links & Resources:")
    print("  • Company Website: https://nainovate.ai")
    print("  • Email: info@nainovate.ai")
    print()
    
    # Open README option
    choice = input("Open README.md file? (y/n): ").strip().lower()
    if choice in ['y', 'yes']:
        readme_path = Path("README.md")
        if readme_path.exists():
            if os.name == 'nt':  # Windows
                os.system(f'start notepad "{readme_path}"')
            else:  # Unix-like systems
                os.system(f'xdg-open "{readme_path}"')
            print("README.md opened")
        else:
            print("README.md not found")
    
    print()
    input("Press Enter to continue...")


def main():
    """Main menu loop"""
    while True:
        clear_screen()
        print_header()
        print_menu()
        
        try:
            choice = input(Colors.MENU + "Enter your choice (1-6): " + Colors.RESET).strip()
            
            if choice == "1":
                check_dependencies()
            elif choice == "2":
                start_backend()
            elif choice == "3":
                start_frontend()
            elif choice == "4":
                start_both()
            elif choice == "5":
                open_docs()
            elif choice == "6":
                print()
                print(Colors.SUCCESS + "Thank you for using AI Fine-tuning Dashboard!")
                print()
                break
            else:
                print(Colors.ERROR + "Invalid choice. Please try again.")
                time.sleep(1)
                
        except KeyboardInterrupt:
            print()
            print(Colors.WARNING + "\nExiting...")
            break
        except Exception as e:
            print(Colors.ERROR + f"An error occurred: {e}")
            input(Colors.WARNING + "Press Enter to continue...")


if __name__ == "__main__":
    main()
