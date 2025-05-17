import { create } from 'zustand';
import type { Process, Resource, Allocation, Request } from '../types/simulatorTypes';

type SimulatorState = {
  processes: Process[];
  resources: Resource[];
  allocations: Allocation[];
  requests: Request[];

  // Actions
  addProcess: (id: string) => void;
  removeProcess: (id: string) => void;
  addResource: (id: string, total: number) => void;
  allocate: (allocation: Allocation) => void;
  request: (request: Request) => void;
  reset: () => void;
};

export const useSimulatorStore = create<SimulatorState>((set) => ({
  processes: [],
  resources: [],
  allocations: [],
  requests: [],

  addProcess: (id) =>
    set((state) => ({
      processes: [...state.processes, { id }],
    })),

  removeProcess: (id) =>
    set((state) => ({
      processes: state.processes.filter((p) => p.id !== id),
      allocations: state.allocations.filter((a) => a.processId !== id),
      requests: state.requests.filter((r) => r.processId !== id),
    })),

  addResource: (id, total) =>
    set((state) => ({
      resources: [...state.resources, { id, total, available: total }],
    })),

  allocate: (allocation) =>
    set((state) => {
      const updatedResources = state.resources.map((res) => {
        if (res.id === allocation.resourceId) {
          return {
            ...res,
            available: res.available - allocation.amount,
          };
        }
        return res;
      });
      return {
        allocations: [...state.allocations, allocation],
        resources: updatedResources,
      };
    }),

  request: (request) =>
    set((state) => ({
      requests: [...state.requests, request],
    })),

  reset: () =>
    set({
      processes: [],
      resources: [],
      allocations: [],
      requests: [],
    }),
}));
