"use client";

import { useDeadlockStore } from "@/store/useDeadlockStore";
import { ScrollArea } from "./ui/scroll-area";

const SimulationLogs = () => {
  const simulationResult = useDeadlockStore((s) => s.simulationResult);
  const currentStep = useDeadlockStore((s) => s.currentStep);

  // Get all steps up to the current step
  const currentLogs = simulationResult?.simulation?.steps
    ?.slice(0, currentStep + 1)
    .map((step) => ({
      step: step.step,
      action: step.action,
    })) || [];

  // Add deadlock detection result if available and we're at the last step
  const isLastStep = currentStep === (simulationResult?.simulation?.steps?.length || 0) - 1;
  if (isLastStep && simulationResult) {
    const deadlockStatus = simulationResult.deadlocked
      ? `Deadlock detected! Cycle: ${simulationResult.cycle_nodes.join(" → ")}`
      : "No deadlock detected";
    currentLogs.push({
      step: currentLogs.length + 1,
      action: deadlockStatus,
    });
  }

  return (
    <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
      <h2 className="font-semibold mb-4 text-card-foreground">Simulation Logs</h2>
      <ScrollArea className="h-[200px] w-full rounded-md border border-border p-4">
        {currentLogs.length > 0 ? (
          <ul className="text-sm text-muted-foreground space-y-2">
            {currentLogs.map((log, index) => (
              <li
                key={index}
                className={`py-1 px-2 rounded ${index === currentLogs.length - 1
                    ? "bg-muted/50 font-medium"
                    : ""
                  }`}
              >
                Step {log.step} &nbsp; {log.action}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No simulation logs yet. Run the deadlock detection to see logs.
          </p>
        )}
      </ScrollArea>
    </div>
  );
};

export default SimulationLogs;