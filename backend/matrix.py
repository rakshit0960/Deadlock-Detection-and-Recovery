import json
import os

def is_deadlocked(available, allocation, request, simulation_id="matrix_sim"):
    n = len(allocation)
    m = len(available)

    work = available.copy()
    finish = [False] * n
    history = []

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
            if not finish[i] and all(request[i][j] <= work[j] for j in range(m)):
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
        if not made_progress:
            break

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
