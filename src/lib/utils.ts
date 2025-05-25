import { useSimulatorStore } from "@/store/useSimulatorStore";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Process, Resource } from "@/types/simulatorTypes"; // Assuming types are here

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Define a return type for getAPIInput for better type safety
export interface APIInputType {
  processes: Process[];
  resources: Resource[];
  available: number[];
  allocation: number[][];
  request: number[][];
  simulation_id: string; // Keep this if your backend expects it
}

export const getAPIInput = (): APIInputType => {
  const simulatorState = useSimulatorStore.getState();
  const processes = simulatorState.processes;
  const resources = simulatorState.resources;
  const allocations = simulatorState.allocations;
  const requests = simulatorState.requests;

  const processIndex = Object.fromEntries(processes.map((p, i) => [p.id, i]));
  const resourceIndex = Object.fromEntries(resources.map((r, i) => [r.id, i]));

  const available = resources.map((r) => r.available);
  const allocationMatrix = processes.map(() => Array(resources.length).fill(0));
  const requestMatrix = processes.map(() => Array(resources.length).fill(0));

  allocations.forEach(({ processId, resourceId, amount }) => {
    if (processIndex[processId] !== undefined && resourceIndex[resourceId] !== undefined) {
      allocationMatrix[processIndex[processId]][resourceIndex[resourceId]] = amount;
    }
  });

  requests.forEach(({ processId, resourceId, amount }) => {
    if (processIndex[processId] !== undefined && resourceIndex[resourceId] !== undefined) {
      requestMatrix[processIndex[processId]][resourceIndex[resourceId]] = amount;
    }
  });

  return {
    processes, // Include raw processes
    resources, // Include raw resources
    available,
    allocation: allocationMatrix,
    request: requestMatrix,
    simulation_id: "sim_frontend", // Generic simulation_id, can be overridden
  };
};
