from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Any, Dict
from matrix import is_deadlocked
from rag_wfg import run_deadlock_detection

app = FastAPI()

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

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.post("/api/matrix")
def matrix_simulation(input_data: MatrixInput):
    try:
        deadlocked = is_deadlocked(
            input_data.available,
            input_data.allocation,
            input_data.request,
            input_data.simulation_id
        )
        # Optionally, load the last simulation steps from file
        with open("matrix_simulations.json", "r") as f:
            simulations = [sim for sim in __import__('json').load(f) if sim["simulation_id"] == input_data.simulation_id]
        return {
            "deadlocked": deadlocked,
            "simulation": simulations[-1] if simulations else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/wfg")
def wfg_simulation(input_data: WFGInput):
    try:
        deadlocked, cycle_nodes, file_path = run_deadlock_detection(
            input_data.available,
            input_data.allocation,
            input_data.request,
            input_data.simulation_id
        )
        # Optionally, load the last simulation steps from file
        with open("deadlock_simulations.json", "r") as f:
            simulations = [sim for sim in __import__('json').load(f) if sim["simulation_id"] == input_data.simulation_id]
        return {
            "deadlocked": deadlocked,
            "cycle_nodes": list(cycle_nodes),
            "simulation": simulations[-1] if simulations else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))