import json
import os
from collections import defaultdict

class DeadlockDetector:
    def __init__(self):
        self.history = []

    def build_rag(self, allocation, request, num_processes, num_resources):
        rag = defaultdict(set)
        step = {"step": 0, "action": "Initial Resource Allocation", "graph": {}}

        for i in range(num_processes):
            for j in range(num_resources):
                if allocation[i][j] > 0:
                    rag[f"R{j}"].add(f"P{i}")

        step["graph"] = {k: list(v) for k, v in rag.items()}
        self.history.append(step)

        for i in range(num_processes):
            for j in range(num_resources):
                if request[i][j] > 0:
                    rag[f"P{i}"].add(f"R{j}")
                    self.history.append({
                        "step": len(self.history),
                        "action": f"P{i} requested R{j}",
                        "graph": {k: list(v) for k, v in rag.items()}
                    })

        return rag

    def convert_rag_to_wfg(self, rag):
        wfg = defaultdict(set)

        for process in rag:
            if process.startswith("P"):
                for resource in rag[process]:
                    if resource.startswith("R"):
                        for holder in rag.get(resource, []):
                            if holder != process:
                                wfg[process].add(holder)

        self.history.append({
            "step": len(self.history),
            "action": "Converted RAG to WFG",
            "graph": {k: list(v) for k, v in wfg.items()}
        })

        return wfg

    def detect_cycle(self, wfg):
        visited = set()
        rec_stack = []
        cycle_nodes = set()

        def dfs(process):
            visited.add(process)
            rec_stack.append(process)
            for neighbor in wfg.get(process, []):
                if neighbor not in visited:
                    if dfs(neighbor):
                        return True
                elif neighbor in rec_stack:
                    cycle_start = rec_stack.index(neighbor)
                    cycle_nodes.update(rec_stack[cycle_start:])
                    return True
            rec_stack.pop()
            return False

        for process in wfg:
            if process not in visited:
                if dfs(process):
                    break

        self.history.append({
            "step": len(self.history),
            "action": (
                f"Cycle Detected: {' -> '.join(cycle_nodes)}"
                if cycle_nodes else "No cycle found"
            ),
            "graph": {k: list(v) for k, v in wfg.items()}
        })

        return bool(cycle_nodes), cycle_nodes

    def save_to_file(self, simulation_id):
        data = []
        filename = "deadlock_simulations.json"
        if os.path.exists(filename):
            with open(filename, "r") as f:
                try:
                    data = json.load(f)
                except json.JSONDecodeError:
                    data = []

        data.append({"simulation_id": simulation_id, "steps": self.history})

        with open(filename, "w") as f:
            json.dump(data, f, indent=4)

        return filename

def run_deadlock_detection(available, allocation, request, simulation_id="sim"):
    detector = DeadlockDetector()
    num_processes = len(allocation)
    num_resources = len(available)

    rag = detector.build_rag(allocation, request, num_processes, num_resources)
    wfg = detector.convert_rag_to_wfg(rag)
    deadlocked, cycle_nodes = detector.detect_cycle(wfg)
    path = detector.save_to_file(simulation_id)

    return deadlocked, cycle_nodes, path
