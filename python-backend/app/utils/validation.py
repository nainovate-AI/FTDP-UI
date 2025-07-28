import re
from pathlib import Path

def validate_file_path(file_path: str) -> bool:
    try:
        path = Path(file_path).resolve()
        # Ensure path is within allowed directory (customize as needed)
        return str(path).startswith(str(Path.cwd()))
    except Exception:
        return False

def sanitize_filename(filename: str) -> str:
    filename = re.sub(r'[<>:"/\\|?*]', '', filename)
    return filename.strip()
