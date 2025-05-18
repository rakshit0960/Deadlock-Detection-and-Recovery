def is_deadlocked(available, allocation, request):
    n = len(allocation)
    m = len(available)

    print("\nAvailable Resources:")
    print(available)

    print("\nAllocation Matrix:")
    for row in allocation:
        print(row)

    print("\nRequest Matrix:")
    for row in request:
        print(row)

    work = available.copy()
    finish = [False] * n
    made_progress = True

    while made_progress:
        made_progress = False
        for i in range(n):
            if finish[i]:
                continue
            if all(request[i][j] <= work[j] for j in range(m)):
                for j in range(m):
                    work[j] += allocation[i][j]
                finish[i] = True
                made_progress = True

    return any(not f for f in finish)
