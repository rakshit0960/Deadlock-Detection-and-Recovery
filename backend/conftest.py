import pytest
from fastapi.testclient import TestClient
import os
import json
import sys
from pathlib import Path

# Add the backend directory to the Python path
sys.path.insert(0, str(Path(__file__).parent))

from main import app

@pytest.fixture(scope="session")
def client():
    """Create a test client for the FastAPI application"""
    return TestClient(app)

@pytest.fixture(autouse=True)
def setup_test_files():
    """Setup function that runs before each test"""
    # Create empty simulation files if they don't exist
    if not os.path.exists("matrix_simulations.json"):
        with open("matrix_simulations.json", "w") as f:
            json.dump([], f)
    if not os.path.exists("deadlock_simulations.json"):
        with open("deadlock_simulations.json", "w") as f:
            json.dump([], f)
    yield
    # Cleanup after tests if needed