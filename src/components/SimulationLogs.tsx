"use client";

import { useDeadlockStore } from "@/store/useDeadlockStore";
import { ScrollArea } from "./ui/scroll-area";
import type { WfgSimulationStep, MatrixSimulationStep } from "@/store/useDeadlockStore";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface SimulationLog {
  step: number;
  action: string;
  isResult?: boolean;
  hasDeadlock?: boolean;
}

const SimulationLogs = () => {
  const simulationType = useDeadlockStore((s) => s.simulationType);
  const wfgSimulationResult = useDeadlockStore((s) => s.wfgSimulationResult);
  const matrixSimulationResult = useDeadlockStore((s) => s.matrixSimulationResult);
  const currentStep = useDeadlockStore((s) => s.currentStep);

  const simulationResult = simulationType === 'wfg' ? wfgSimulationResult : matrixSimulationResult;

  // Get all steps up to the current step
  const currentLogs: SimulationLog[] = simulationResult?.simulation?.steps
    ?.slice(0, currentStep + 1)
    .map((step: WfgSimulationStep | MatrixSimulationStep) => ({
      step: step.step,
      action: step.action,
    })) || [];

  // Add deadlock detection result if available and we're at the last step
  const isLastStep = currentStep === (simulationResult?.simulation?.steps?.length || 0) - 1;
  if (isLastStep && simulationResult) {
    const deadlockStatus = simulationResult.deadlocked
      ? `Deadlock detected!${simulationType === 'wfg' && wfgSimulationResult ? ` Cycle: ${wfgSimulationResult.cycle_nodes.join(" → ")}` : ''}`
      : "No deadlock detected";
    currentLogs.push({
      step: currentLogs.length + 1,
      action: deadlockStatus,
      isResult: true,
      hasDeadlock: simulationResult.deadlocked
    });
  }

  return (
    <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
      <h2 className="font-semibold mb-4 text-card-foreground flex items-center gap-2">
        <span>Simulation Logs</span>
        {currentLogs.length > 0 && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            {currentLogs.length} steps
          </span>
        )}
      </h2>
      <ScrollArea className="h-[200px] w-full rounded-md border border-border p-4">
        {currentLogs.length > 0 ? (
          <ul className="text-sm text-muted-foreground space-y-2">
            {currentLogs.map((log: SimulationLog, index: number) => (
              <li
                key={index}
                className={`py-2 px-3 rounded-md flex items-center gap-2 transition-colors ${
                  log.isResult
                    ? log.hasDeadlock
                      ? "bg-destructive/10 text-destructive font-medium"
                      : "bg-success/10 text-success font-medium"
                    : index === currentStep
                      ? "bg-muted"
                      : "hover:bg-muted/50"
                }`}
              >
                {log.isResult && (
                  log.hasDeadlock
                    ? <AlertCircle className="h-4 w-4" />
                    : <CheckCircle2 className="h-4 w-4" />
                )}
                <span className="font-mono">Step {log.step}</span>
                <span className="flex-1">{log.action}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-muted-foreground text-center px-4 py-2 bg-muted/50 rounded-md">
              No simulation logs yet. Run the deadlock detection to see logs.
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default SimulationLogs;