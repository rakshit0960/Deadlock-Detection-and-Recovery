"use client";

import { useDeadlockStore } from "@/store/useDeadlockStore";
import { ScrollArea } from "./ui/scroll-area";
import type { WfgSimulationStep, MatrixSimulationStep } from "@/types/deadlock";
import { AlertCircle, CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface SimulationLog {
  step: number;
  action: string;
  isResult?: boolean;
  hasDeadlock?: boolean;
  raw?: string; // for recovery response
}

const SimulationLogs = () => {
  const simulationType = useDeadlockStore((s) => s.simulationType);
  const wfgSimulationResult = useDeadlockStore((s) => s.wfgSimulationResult);
  const matrixSimulationResult = useDeadlockStore((s) => s.matrixSimulationResult);
  const recoverySimulationResult = useDeadlockStore((s) => s.recoverySimulationResult);
  const currentStep = useDeadlockStore((s) => s.currentStep);
  const [expandedLogs, setExpandedLogs] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const simulationResult = simulationType === 'wfg' ? wfgSimulationResult : simulationType === 'matrix' ? matrixSimulationResult : null;

  let currentLogs: SimulationLog[] = [];

  if (simulationType === 'recovery' && recoverySimulationResult) {
    // Use the raw textual response array for logs
    currentLogs = recoverySimulationResult.response.map((raw, idx) => ({
      step: idx,
      action: `Snapshot ${idx}`,
      raw,
    }));
  } else if (simulationResult?.simulation?.steps) {
    currentLogs = simulationResult.simulation.steps
      ?.slice(0, currentStep + 1)
      .map((step: WfgSimulationStep | MatrixSimulationStep) => ({
        step: step.step,
        action: step.action,
      })) || [];
  }

  // Add summary result for detection simulations (not recovery)
  if (simulationType !== 'recovery') {
    const isLastStep = currentStep === (simulationResult?.simulation?.steps?.length || 0) - 1;
    if (isLastStep && simulationResult) {
      const deadlockStatus = simulationResult.deadlocked
        ? `Deadlock detected!${simulationType === 'wfg' && wfgSimulationResult ? ` Cycle: ${wfgSimulationResult.cycle_nodes.join(" → ")}` : ''}`
        : 'No deadlock detected';
      currentLogs.push({
        step: currentLogs.length + 1,
        action: deadlockStatus,
        isResult: true,
        hasDeadlock: simulationResult.deadlocked,
      });
    }
  }

  const toggleLogExpansion = (index: number) => {
    setExpandedLogs(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const filteredLogs = currentLogs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.raw && log.raw.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`bg-card rounded-lg shadow-lg p-6 border border-border transition-all duration-300 ${isExpanded ? 'fixed inset-4 z-50 overflow-hidden' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-card-foreground flex items-center gap-2">
          <span>Simulation Logs</span>
          {currentLogs.length > 0 && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              {currentLogs.length} entries
            </span>
          )}
        </h2>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1 text-sm rounded-md border border-border bg-background"
          />
          <button
            onClick={toggleExpand}
            className="text-sm text-primary hover:text-primary/80"
          >
            {isExpanded ? 'Minimize' : 'Maximize'}
          </button>
        </div>
      </div>
      <ScrollArea className={`w-full rounded-md border border-border p-4 transition-all duration-300 ${isExpanded ? 'h-[calc(100vh-8rem)]' : 'h-[300px]'}`}>
        {filteredLogs.length > 0 ? (
          <ul className="text-sm text-muted-foreground space-y-2">
            {filteredLogs.map((log, index) => (
              <li 
                key={index} 
                className={`py-2 px-3 rounded-md flex flex-col gap-1 transition-colors
                  ${log.isResult 
                    ? (log.hasDeadlock ? 'bg-destructive/10 text-destructive font-medium' : 'bg-success/10 text-success font-medium') 
                    : index === currentStep ? 'bg-muted' : 'hover:bg-muted/50'}`}
              >
                <div 
                  className={`flex items-center gap-2 ${log.raw ? 'cursor-pointer' : ''}`}
                  onClick={() => log.raw && toggleLogExpansion(index)}
                >
                  {log.isResult && (log.hasDeadlock ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />)}
                  {log.raw && (
                    expandedLogs.includes(index) 
                      ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-mono">{simulationType === 'recovery' ? `Snapshot ${index}` : `Step ${log.step}`}</span>
                  {!log.raw && <span className="flex-1">{log.action}</span>}
                </div>
                {log.raw && expandedLogs.includes(index) && (
                  <div className="mt-2">
                    <pre className="whitespace-pre-wrap text-xs text-muted-foreground bg-background p-2 rounded-md border border-border max-h-96 overflow-auto">{log.raw.trim()}</pre>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-muted-foreground text-center px-4 py-2 bg-muted/50 rounded-md">
              {searchTerm ? 'No logs match your search.' : 'No simulation logs yet. Run a simulation to see logs.'}
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default SimulationLogs;