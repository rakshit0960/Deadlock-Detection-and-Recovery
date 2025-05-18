from matrix import is_deadlocked as banker_deadlock
from rag_wfg import run_deadlock_detection as wfg_deadlock

def load_static_inputs():
    available = [0, 0, 0]

    allocation = [
        [1, 0, 0],  # P0 holds R0
        [0, 1, 0],  # P1 holds R1
        [0, 0, 1]   # P2 holds R2
    ]

    request = [
        [0, 0, 0],  # P0 requests nothing
        [0, 0, 1],  # P1 requests R2
        [0, 0, 0]   # P2 requests nothing
    ]
    '''available = [1, 1, 0]
    allocation = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ]
    request = [
        [0, 1, 0],
        [0, 0, 1],
        [1, 0, 0]
    ]'''

    return available, allocation, request

def main():
    print("=== Deadlock Detection Tool ===")
    print("Choose method:")
    print("1. Banker's Algorithm (Matrix-Based)")
    print("2. Wait-For Graph (WFG)")

    while True:
        method = input("Enter choice (1 or 2): ").strip()
        if method in ("1", "2"):
            break
        print("Invalid input. Please enter 1 or 2.")

    available, allocation, request = load_static_inputs()

    if method == "1":
        if banker_deadlock(available, allocation, request):
            print("🔴 Deadlock detected using Banker's Algorithm.")
        else:
            print("✅ No deadlock detected using Banker's Algorithm.")
    else:
        print("\n[Using Wait-For Graph (RAG to WFG)]")
        deadlocked, cycle_nodes, file_path = wfg_deadlock(available, allocation, request, "wfg_sim")
        if deadlocked:
            print(f"🔴 Deadlock detected using WFG. Cycle Nodes: {cycle_nodes}")
        else:
            print("✅ No deadlock detected using WFG.")
        print(f"Simulation steps saved to: {file_path}")

if __name__ == "__main__":
    main()
