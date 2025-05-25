import { useSimulatorStore } from "@/store/useSimulatorStore";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getAPIInput = () => {
  const processes = useSimulatorStore.getState().processes;
  const resources = useSimulatorStore.getState().resources;
  const allocations = useSimulatorStore.getState().allocations;
  const requests = useSimulatorStore.getState().requests;

  const processIndex = Object.fromEntries(processes.map((p, i) => [p.id, i]));
  const resourceIndex = Object.fromEntries(resources.map((r, i) => [r.id, i]));

  const available = resources.map((r) => r.available);
  const allocation = processes.map(() => resources.map(() => 0));
  const request = processes.map(() => resources.map(() => 0));

  allocations.forEach(({ processId, resourceId, amount }) => {
    const i = processIndex[processId];
    const j = resourceIndex[resourceId];
    allocation[i][j] = amount;
  });

  requests.forEach(({ processId, resourceId, amount }) => {
    const i = processIndex[processId];
    const j = resourceIndex[resourceId];
    request[i][j] = amount;
  });

  return {
    available,
    allocation,
    request,
    simulation_id: "matrix_sim",
  };
};
