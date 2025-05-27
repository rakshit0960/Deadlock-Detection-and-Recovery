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
  removeResource: (id: string) => void;
  updateResource: (id: string, newTotal: number) => void;
  allocate: (allocation: Allocation) => void;
  request: (request: Request) => void;
  reset: () => void;
  clearAll: () => void;
};

export const useSimulatorStore = create<SimulatorState>((set) => ({
  processes: [
    { id: 'P0' },
    { id: 'P1' },
  ],
  resources: [
    { id: 'R0', total: 1, available: 1 },
    { id: 'R1', total: 1, available: 1 },
  ],
  allocations: [
    { processId: 'P1', resourceId: 'R0', amount: 1 },
    { processId: 'P1', resourceId: 'R1', amount: 1 },
  ],
  requests: [
    { processId: 'P0', resourceId: 'R0', amount: 1 },
    { processId: 'P0', resourceId: 'R1', amount: 1 },
  ],

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

  removeResource: (id) =>
    set((state) => ({
      resources: state.resources.filter((r) => r.id !== id),
      allocations: state.allocations.filter((a) => a.resourceId !== id),
      requests: state.requests.filter((r) => r.resourceId !== id),
    })),

  updateResource: (id, newTotal) =>
    set((state) => ({
      resources: state.resources.map((res) => {
        if (res.id === id) {
          const currentlyAllocated = res.total - res.available;
          if (newTotal < currentlyAllocated) {
            console.warn(`Cannot update resource ${id}: new total ${newTotal} is less than currently allocated ${currentlyAllocated}`);
            return res;
          }
          return {
            ...res,
            total: newTotal,
            available: newTotal - currentlyAllocated,
          };
        }
        return res;
      }),
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

  clearAll: () =>
    set({
      processes: [],
      resources: [],
      allocations: [],
      requests: [],
    }),
}));
