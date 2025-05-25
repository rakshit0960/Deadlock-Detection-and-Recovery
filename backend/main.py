from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from matrix import is_deadlocked
from rag_wfg import run_deadlock_detection
import numpy as np
from stable_baselines3 import PPO
import gym
from env import DeadlockRecoveryEnv
import traceback
from typing import List, Optional
import json

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




app = FastAPI()

# Print registered routes for debugging
@app.on_event("startup")
async def startup_event():
    print("Registered routes:")
    for route in app.routes:
        print(f"{route.methods} {route.path}")

class MatrixInput(BaseModel):
    available: List[int]
    allocation: List[List[int]]
    request: List[List[int]]
    simulation_id: str = "matrix_sim"

class WFGInput(BaseModel):
    available: List[int]
    allocation: List[List[int]]
    request: List[List[int]]
    simulation_id: str = "wfg_sim"

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

# Load the trained model for deadlock recovery
try:
    model = PPO.load("ppo_deadlock_multi_env")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@app.get("/")
async def read_root():
    return {"message": "Hello World"}

@app.post("/api/matrix")
async def matrix_simulation(input_data: MatrixInput):
    try:
        deadlocked = is_deadlocked(
            input_data.available,
            input_data.allocation,
            input_data.request,
            input_data.simulation_id
        )
        # Optionally, load the last simulation steps from file
        with open("matrix_simulations.json", "r") as f:
            simulations = [sim for sim in json.load(f) if sim["simulation_id"] == input_data.simulation_id]
        return {
            "deadlocked": deadlocked,
            "simulation": simulations[-1] if simulations else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/wfg")
async def wfg_simulation(input_data: WFGInput):
    try:
        deadlocked, cycle_nodes, file_path = run_deadlock_detection(
            input_data.available,
            input_data.allocation,
            input_data.request,
            input_data.simulation_id
        )
        # Optionally, load the last simulation steps from file
        with open("deadlock_simulations.json", "r") as f:
            simulations = [sim for sim in json.load(f) if sim["simulation_id"] == input_data.simulation_id]
        return {
            "deadlocked": deadlocked,
            "cycle_nodes": list(cycle_nodes),
            "simulation": simulations[-1] if simulations else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/deadlock_recovery")
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