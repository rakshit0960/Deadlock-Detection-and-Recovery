import json
import os

def is_deadlocked(available, allocation, request, simulation_id="matrix_sim"):
    """
    Implements the Banker's algorithm for deadlock detection.

    Args:
        available: List of available resources
        allocation: Matrix of current resource allocation to processes
        request: Matrix of resource requests from processes
        simulation_id: ID for saving simulation history

    Returns:
        bool: True if deadlock detected, False otherwise
    """
    # Input validation
    if not available or not allocation or not request:
        raise ValueError("Input arrays cannot be empty")

    n = len(allocation)  # Number of processes
    m = len(available)   # Number of resource types

    # Validate dimensions
    if any(len(row) != m for row in allocation) or any(len(row) != m for row in request):
        raise ValueError("Inconsistent dimensions in input matrices")

    work = available.copy()  # Available resources for allocation
    finish = [False] * n     # Track which processes can complete
    history = []

    # Record initial state
    history.append({
        "step": 0,
        "action": "Initial State",
        "available": available,
        "allocation": allocation,
        "request": request,
        "finish": finish.copy()
    })

    step = 1
    while True:
        made_progress = False
        for i in range(n):
            # Check if process i can complete:
            # 1. Not already marked as finished
            # 2. Its resource requests can be satisfied
            if not finish[i] and all(request[i][j] <= work[j] for j in range(m)):
                # Release all resources held by process i
                for j in range(m):
                    work[j] += allocation[i][j]
                finish[i] = True
                made_progress = True

                history.append({
                    "step": step,
                    "action": f"Process P{i} can finish. Resources released.",
                    "work": work.copy(),
                    "finish": finish.copy()
                })
                step += 1

        # If no process could make progress in this iteration, exit loop
        if not made_progress:
            break

    # Deadlock exists if any process couldn't finish
    deadlocked = any(not f for f in finish)
    history.append({
        "step": step,
        "action": "Deadlock Check Completed",
        "result": "Deadlock Detected" if deadlocked else "No Deadlock",
        "final_finish": finish
    })

    save_simulation(history, simulation_id)
    return deadlocked

def save_simulation(history, simulation_id):
    """
    Saves simulation history to a JSON file.

    Args:
        history: List of simulation steps
        simulation_id: Unique identifier for this simulation
    """
    filename = "matrix_simulations.json"
    data = []
    if os.path.exists(filename):
        with open(filename, "r") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                data = []

    data.append({"simulation_id": simulation_id, "steps": history})
    with open(filename, "w") as f:
        json.dump(data, f, indent=4)
