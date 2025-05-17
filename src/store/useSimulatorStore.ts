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
};

export const useSimulatorStore = create<SimulatorState>((set) => ({
  processes: [
    { id: 'P1' },
    { id: 'P2' },
    { id: 'P3' },
    { id: 'P4' }
  ],
  resources: [
    { id: 'R1', total: 12, available: 7 },
    { id: 'R2', total: 8, available: 5 },
    { id: 'R3', total: 10, available: 6 }
  ],
  allocations: [
    { processId: 'P1', resourceId: 'R1', amount: 2 },
    { processId: 'P1', resourceId: 'R2', amount: 1 },
    { processId: 'P2', resourceId: 'R2', amount: 2 },
    { processId: 'P3', resourceId: 'R1', amount: 3 },
    { processId: 'P3', resourceId: 'R3', amount: 2 },
    { processId: 'P4', resourceId: 'R2', amount: 0 }
  ],
  requests: [
    { processId: 'P1', resourceId: 'R3', amount: 3 },
    { processId: 'P2', resourceId: 'R1', amount: 2 },
    { processId: 'P2', resourceId: 'R3', amount: 1 },
    { processId: 'P4', resourceId: 'R1', amount: 4 }
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
}));
