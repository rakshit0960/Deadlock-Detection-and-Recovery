from matrix import is_deadlocked as banker_deadlock
from rag_wfg import run_deadlock_detection as wfg_deadlock

def load_static_inputs():
    available = [1, 0, 0]

    allocation = [
        [0, 1, 0],  # P0 holds R1
        [1, 0, 1],  # P1 holds R0 and R2
        [1, 1, 0]   # P2 holds R0 and R1
    ]

    request = [
        [1, 0, 1],  # P0 requests R0 and R2
        [0, 1, 0],  # P1 requests R1
        [0, 0, 1]   # P2 requests R2
    ]


    return available, allocation, request

def main():
    print("=== Deadlock Detection Tool ===")
    print("Choose method:")
    print("1. Safety Algorithm (Matrix-Based)")
    print("2. Wait-For Graph (WFG)")

    while True:
        method = input("Enter choice (1 or 2): ").strip()
        if method in ("1", "2"):
            break
        print("Invalid input. Please enter 1 or 2.")

    available, allocation, request = load_static_inputs()

    if method == "1":
        if banker_deadlock(available, allocation, request):
            print("🔴 Deadlock detected using matrix.")
        else:
            print("✅ No deadlock detected using matrix.")
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
