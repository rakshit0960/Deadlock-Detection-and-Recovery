from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from stable_baselines3 import PPO
import gym
import unittest
from fastapi.testclient import TestClient
import sys
import os
import json
from pathlib import Path
import pytest

# Add the parent directory to the Python path
sys.path.insert(0, str(Path(__file__).parent))

from main import app

from env import DeadlockRecoveryEnv

app = FastAPI()

class MatrixInput(BaseModel):
    allocation: List[List[int]]
    request: List[List[int]]
    available: List[int]

class SimulationStep(BaseModel):
    step: int
    action: str
    available: Optional[List[int]] = None
    allocation: Optional[List[List[int]]] = None
    request: Optional[List[List[int]]] = None
    work: Optional[List[int]] = None
    finish: List[bool]
    result: Optional[str] = None
    final_finish: Optional[List[bool]] = None

class SimulationResult(BaseModel):
    simulation_id: str
    steps: List[SimulationStep]

model = PPO.load("ppo_deadlock_multi_env")  # Load trained model

@app.post("/deadlock_recovery", response_model=SimulationResult)
def deadlock_recovery(matrix_input: MatrixInput):
    allocation = np.array(matrix_input.allocation)
    request = np.array(matrix_input.request)
    available = np.array(matrix_input.available)

    num_processes = len(allocation)
    env = DeadlockRecoveryEnv(num_processes=num_processes, num_resources=len(available))
    obs = env.reset(allocation=allocation, request=request, available=available)

    steps = []
    step_count = 0
    done = False

    while not done:
        step_info = SimulationStep(
            step=step_count,
            action=f"Step {step_count} executed",
            allocation=env.allocation.tolist(),
            request=env.request.tolist(),
            available=env.available.tolist(),
            finish=[bool(np.all(env.request[i] == 0)) for i in range(env.num_processes)]
        )
        steps.append(step_info)

        action, _ = model.predict(obs)
        obs, reward, done, _ = env.step(action)
        step_count += 1

    steps.append(SimulationStep(
        step=step_count,
        action="Deadlock Check Completed",
        result="No Deadlock" if not env._is_deadlocked() else "Deadlock Detected",
        final_finish=[bool(np.all(env.request[i] == 0)) for i in range(env.num_processes)],
        finish=[bool(np.all(env.request[i] == 0)) for i in range(env.num_processes)]
    ))

    return SimulationResult(
        simulation_id="matrix_sim",
        steps=steps
    )

# Create a test client
client = TestClient(app)

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

@pytest.mark.asyncio
async def test_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}

@pytest.mark.asyncio
async def test_matrix_simulation(client):
    test_input = {
        "allocation": [[0, 1], [2, 0]],
        "request": [[2, 0], [0, 1]],
        "available": [1, 1],
        "simulation_id": "test_matrix_sim"
    }

    response = client.post("/api/matrix", json=test_input)
    assert response.status_code == 200
    result = response.json()

    # Check response structure
    assert "deadlocked" in result
    assert "simulation" in result

@pytest.mark.asyncio
async def test_wfg_simulation(client):
    test_input = {
        "allocation": [[0, 1], [2, 0]],
        "request": [[2, 0], [0, 1]],
        "available": [1, 1],
        "simulation_id": "test_wfg_sim"
    }

    response = client.post("/api/wfg", json=test_input)
    assert response.status_code == 200
    result = response.json()

    # Check response structure
    assert "deadlocked" in result
    assert "cycle_nodes" in result
    assert "simulation" in result

@pytest.mark.asyncio
async def test_deadlock_recovery(client):
    # Create a 10x5 matrix for allocation and request
    test_input = {
        "allocation": [
            [0, 1, 0, 0, 0],  # P0
            [2, 0, 1, 0, 0],  # P1
            [0, 0, 0, 1, 0],  # P2
            [1, 1, 0, 0, 1],  # P3
            [0, 0, 2, 0, 0],  # P4
            [0, 1, 0, 1, 0],  # P5
            [1, 0, 0, 0, 2],  # P6
            [0, 2, 0, 0, 0],  # P7
            [0, 0, 1, 1, 0],  # P8
            [1, 0, 0, 0, 1]   # P9
        ],
        "request": [
            [1, 0, 1, 0, 0],  # P0
            [0, 1, 0, 1, 0],  # P1
            [0, 0, 1, 0, 1],  # P2
            [0, 0, 0, 1, 0],  # P3
            [1, 0, 0, 0, 1],  # P4
            [0, 1, 0, 0, 0],  # P5
            [0, 0, 1, 1, 0],  # P6
            [1, 0, 0, 0, 1],  # P7
            [0, 1, 0, 0, 0],  # P8
            [0, 0, 1, 0, 1]   # P9
        ],
        "available": [2, 3, 2, 2, 3],
        "simulation_id": "test_recovery"
    }

    response = client.post("/api/deadlock_recovery", json=test_input)
    assert response.status_code == 200
    result = response.json()

    # Check response structure
    assert "simulation_id" in result
    assert "steps" in result
    assert len(result["steps"]) > 0

if __name__ == "__main__":
    unittest.main()
