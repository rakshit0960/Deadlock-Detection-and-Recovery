import { APIInputType, getAPIInput } from '@/lib/utils'; // Import APIInputType
import type { Edge } from "@xyflow/react";
import { MarkerType } from "@xyflow/react";
import { create } from 'zustand';
import { useRAGStore } from './useRAGStore';

// Interface for Wait-For Graph simulation steps
export interface WfgSimulationStep {
  step: number;
  action: string;
  graph?: Record<string, string[]>; // Graph representation for each step
}

// Interface for Banker's Algorithm (Matrix) simulation steps
export interface MatrixSimulationStep {
  step: number;
  action: string;
  available?: number[];      // Available resources vector
  allocation?: number[][];   // Current allocation matrix
  request?: number[][];      // Request matrix
  work?: number[];          // Work vector used in algorithm
  finish: boolean[];        // Finish vector tracking completed processes
  result?: string;          // Step result message
  final_finish?: boolean[]; // Final state of finish vector
}

// Response interface for WFG deadlock detection
export interface WfgSimulationResponse {
  deadlocked: boolean;      // Whether deadlock was detected
  cycle_nodes: string[];    // Nodes involved in deadlock cycle
  simulation: {
    simulation_id: string;
    steps: WfgSimulationStep[]; // Simulation steps for WFG
  } | null;
}

// Response interface for Matrix (Banker's) deadlock detection
export interface MatrixSimulationResponse {
  deadlocked: boolean;     // Whether deadlock was detected
  simulation: {
    simulation_id: string;
    steps: MatrixSimulationStep[]; // Simulation steps for Matrix
  } | null;
}

// Main store interface defining state and actions
interface DeadlockStore {
  // State properties
  isLoading: boolean;                                        // Loading state flag
  error: string | null;                                      // Error message if any
  wfgSimulationResult: WfgSimulationResponse | null;         // WFG simulation results
  matrixSimulationResult: MatrixSimulationResponse | null;   // Matrix simulation results
  currentStep: number;                                       // Current step in simulation
  isAnimating: boolean;                                      // Animation state
  animationSpeed: number;                                    // Animation speed in ms
  animationTimer: NodeJS.Timeout | null;                     // Timer for animation
  simulationType: 'wfg' | 'matrix' | null;                   // Current simulation type

  // Action methods
  detectDeadlockWithWFG: () => Promise<void>;               // Run WFG detection
  detectDeadlockWithMatrix: () => Promise<void>;            // Run Matrix detection
  goToStep: (step: number) => void;                         // Jump to specific step
  nextStep: () => void;                                     // Go to next step
  prevStep: () => void;                                     // Go to previous step
  startAnimation: () => void;                               // Start animation
  stopAnimation: () => void;                                // Stop animation
  setSpeed: (speed: number) => void;                        // Set animation speed
  updateRAGForCurrentStep: () => void;                      // Update RAG visualization

  // Computed values
  totalSteps: number;                                       // Total steps in simulation
}

// Create and export the deadlock store
export const useDeadlockStore = create<DeadlockStore>((set, get) => ({
  // Initialize state with default values
  isLoading: false,
  error: null,
  wfgSimulationResult: null,
  matrixSimulationResult: null,
  currentStep: 0,
  isAnimating: false,
  animationSpeed: 1000,
  animationTimer: null,
  simulationType: null,
  totalSteps: 0,

  // Implementation of actions
  detectDeadlockWithWFG: async () => {
    // Reset state and clear previous results
    set({ isLoading: true, error: null, currentStep: 0, simulationType: 'wfg', wfgSimulationResult: null, matrixSimulationResult: null });
    get().stopAnimation();
    useRAGStore.getState().clearGraph();

    const inputData: APIInputType = getAPIInput();
    inputData.simulation_id = "wfg_sim_frontend";

    try {
      // Make API request
      const response = await fetch('/api/wfg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ // Send only what WFG API expects
          available: inputData.available,
          allocation: inputData.allocation,
          request: inputData.request,
          simulation_id: inputData.simulation_id,
        }),
      });

      // Handle API errors
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // Process successful response
      const result: WfgSimulationResponse = await response.json();
      set({
        wfgSimulationResult: result,
        totalSteps: result.simulation?.steps?.length || 0,
      });
      if (result.simulation?.steps?.length) {
        get().updateRAGForCurrentStep();
      }
    } catch (e) {
      // Handle errors
      const message = e instanceof Error ? e.message : 'Failed to detect deadlock (WFG).';
      set({ error: message });
      console.error("WFG Deadlock detection error:", e);
    } finally {
      set({ isLoading: false });
    }
  },

  detectDeadlockWithMatrix: async () => {
    set({ isLoading: true, error: null, currentStep: 0, simulationType: 'matrix', wfgSimulationResult: null, matrixSimulationResult: null });
    get().stopAnimation();
    useRAGStore.getState().clearGraph();

    const apiInput: APIInputType = getAPIInput();
    apiInput.simulation_id = "matrix_sim_frontend";

    try {
      // Make API request
      const response = await fetch('/api/matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          available: apiInput.available,
          allocation: apiInput.allocation,
          request: apiInput.request,
          simulation_id: apiInput.simulation_id,
        }),
      });

      // Handle API errors
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // Process successful response
      const result: MatrixSimulationResponse = await response.json();
      set({
        matrixSimulationResult: result,
        totalSteps: result.simulation?.steps?.length || 0,
      });
      if (result.simulation?.steps?.length) {
        get().updateRAGForCurrentStep();
      }
    } catch (e) {
      // Handle errors
      const message = e instanceof Error ? e.message : 'Failed to detect deadlock with matrix.';
      set({ error: message });
      console.error("Matrix deadlock detection error:", e);
    } finally {
      set({ isLoading: false });
    }
  },

  // Placeholder for RAG update implementation
  updateRAGForCurrentStep: () => {
    const { simulationType, currentStep } = get();
    const wfgResult = get().wfgSimulationResult;

    if (simulationType === 'wfg' && wfgResult?.simulation?.steps) {
      const currentStepData = wfgResult.simulation.steps[currentStep];
      const action = currentStepData.action;

      if (action === "Converted RAG to WFG") {
        // Convert RAG to WFG
        const ragStore = useRAGStore.getState();
        const ragEdges = ragStore.edges;

        // Group edges by type
        const requestEdges = new Map<string, string[]>();
        const assignEdges = new Map<string, string>();

        ragEdges.forEach(edge => {
          if (edge.type === 'request') {
            const requests = requestEdges.get(edge.source) || [];
            requestEdges.set(edge.source, [...requests, edge.target]);
          } else if (edge.type === 'allocation') {
            assignEdges.set(edge.source, edge.target);
          }
        });

        // Build WFG edges
        const wfgEdges: Edge[] = [];
        requestEdges.forEach((resources, process) => {
          resources.forEach(resource => {
            const assignedTo = assignEdges.get(resource);
            if (assignedTo) {
              wfgEdges.push({
                id: `wfg-${process}-${assignedTo}`,
                source: process,
                target: assignedTo,
                type: "wfg",
                animated: true,
                data: {},
                style: {
                  stroke: "#60a5fa",
                  strokeWidth: 2,
                },
                labelBgStyle: { fill: "#27272a" },
                labelStyle: { fill: "#e4e4e7" },
                labelBgPadding: [8, 4] as [number, number],
                labelBgBorderRadius: 4,
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: "#60a5fa",
                },
              });
            }
          });
        });

        // Create process nodes
        const wfgNodes = ragStore.nodes
          .filter(node => node.type === 'process')
          .map(node => ({
            ...node,
            position: ragStore.getNodePosition(node.id) || {
              x: Math.random() * 200,
              y: Math.random() * 100,
            },
          }));

        useRAGStore.getState().setGraph(wfgNodes, wfgEdges);

      } else if (action.match(/P\d+ requested R\d+/)) {
        // Highlight the requesting edge
        const [processId, resourceId] = action.match(/P\d+|R\d+/g) || [];
        if (processId && resourceId) {
          const currentNodes = useRAGStore.getState().nodes;
          const currentEdges = useRAGStore.getState().edges.map(edge => {
            if (edge.source === processId && edge.target === resourceId) {
              return {
                ...edge,
                style: {
                  stroke: '#60a5fa',
                  strokeWidth: 3,
                },
                animated: true,
                data: { ...edge.data, highlighted: true },
                labelBgStyle: { fill: "#27272a" },
                labelStyle: { fill: "#e4e4e7" },
                labelBgPadding: [8, 4] as [number, number],
                labelBgBorderRadius: 4,
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: '#60a5fa',
                },
              };
            }
            return {
              ...edge,
              style: edge.data?.highlighted ? {
                stroke: '#60a5fa',
                strokeWidth: 3,
              } : undefined,
              labelBgStyle: { fill: "#27272a" },
              labelStyle: { fill: "#e4e4e7" },
              labelBgPadding: [8, 4] as [number, number],
              labelBgBorderRadius: 4,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: edge.data?.highlighted ? '#60a5fa' : '#a1a1aa',
              },
              data: { ...edge.data }
            };
          });
          useRAGStore.getState().setGraph(currentNodes, currentEdges);
        }
      } else {
        // Default RAG view with cycle highlighting if detected
        useRAGStore.getState().clearGraph();
        useRAGStore.getState().clearGraph();
        useRAGStore.getState().updateGraphFromSimulator();
      }
    } else if (simulationType === 'matrix') {
      // Matrix simulation visualization will be implemented later
      useRAGStore.getState().updateGraphFromSimulator();
    }
  },

  // Navigate to specific step
  goToStep: (step) => {
    const { totalSteps } = get();
    const validStep = Math.max(0, Math.min(step, totalSteps - 1));
    set({ currentStep: validStep });
    get().updateRAGForCurrentStep();
  },

  // Move to next step if available
  nextStep: () => {
    const { currentStep, totalSteps } = get();
    if (currentStep < totalSteps - 1) {
      set({ currentStep: currentStep + 1 });
      get().updateRAGForCurrentStep();
    }
  },

  // Move to previous step if available
  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
      get().updateRAGForCurrentStep();
    }
  },

  // Start animation loop
  startAnimation: () => {
    const { isAnimating, totalSteps, animationSpeed } = get();
    if (isAnimating || totalSteps === 0) return;

    set({ isAnimating: true });
    const timer = setInterval(() => {
      const { currentStep, nextStep, stopAnimation: selfStopAnimation } = get();
      if (currentStep < totalSteps - 1) {
        nextStep();
      } else {
        selfStopAnimation(); // Stop animation at end
      }
    }, animationSpeed);
    set({ animationTimer: timer });
  },

  // Stop ongoing animation
  stopAnimation: () => {
    const { animationTimer } = get();
    if (animationTimer) clearInterval(animationTimer);
    set({ isAnimating: false, animationTimer: null });
  },

  // Update animation speed and restart if running
  setSpeed: (speed) => {
    set({ animationSpeed: speed });
    if (get().isAnimating) {
      get().stopAnimation();
      get().startAnimation();
    }
  },
}));