import subprocess
import tempfile
import os
import time
import sys
from typing import Dict, Any

def execute_code(code: str, language: str, input_data: str = "", expected_output: str = "") -> Dict[str, Any]:
    """Execute code locally using subprocess and compare with expected output."""
    language = language.lower()
    ext = ".py" if language == "python" else ".js"
    cmd = [sys.executable] if language == "python" else ["node"]
    
    # Create a temporary file
    with tempfile.NamedTemporaryFile(mode='w', suffix=ext, delete=False, encoding='utf-8') as temp_file:
        temp_file.write(code)
        temp_filename = temp_file.name

    cmd.append(temp_filename)
    
    start_time = time.time()
    try:
        # Run the code
        result = subprocess.run(
            cmd,
            input=input_data,
            text=True,
            capture_output=True,
            timeout=5.0  # 5 second timeout to prevent infinite loops
        )
        runtime = (time.time() - start_time) * 1000  # ms
        
        stdout = result.stdout
        stderr = result.stderr
        
        # Check if successful
        if result.returncode == 0:
            status = "Accepted"
            # Compare output (ignoring trailing/leading whitespace and normalizing newlines)
            actual_stripped = (stdout or "").strip().replace('\r\n', '\n')
            expected_stripped = (expected_output or "").strip().replace('\r\n', '\n')
            
            passed = (actual_stripped == expected_stripped)
            if not passed:
                status = "Wrong Answer"
        else:
            status = "Runtime Error"
            passed = False
            
        return {
            "status": status,
            "runtime": runtime,
            "memory": 0,  # Memory tracking is complex in simple subprocess, default to 0
            "passed": passed,
            "stdout": stdout,
            "stderr": stderr,
            "compile_output": None
        }

    except subprocess.TimeoutExpired as e:
        runtime = (time.time() - start_time) * 1000
        stdout = e.stdout.decode('utf-8') if isinstance(e.stdout, bytes) else (e.stdout or "")
        stderr = e.stderr.decode('utf-8') if isinstance(e.stderr, bytes) else (e.stderr or "")
        
        return {
            "status": "Time Limit Exceeded",
            "runtime": runtime,
            "memory": 0,
            "passed": False,
            "stdout": stdout,
            "stderr": stderr,
            "compile_output": None
        }
    except Exception as e:
        return {
            "status": "Internal Error",
            "runtime": 0,
            "memory": 0,
            "passed": False,
            "stdout": None,
            "stderr": str(e),
            "compile_output": None
        }
    finally:
        # Clean up the temp file
        if os.path.exists(temp_filename):
            try:
                os.remove(temp_filename)
            except:
                pass
