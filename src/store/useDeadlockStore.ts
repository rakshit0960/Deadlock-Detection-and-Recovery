import { APIInputType, getAPIInput } from "@/lib/utils";
import { create } from "zustand";
import { useRAGStore } from "./useRAGStore";
import { updateRAGForCurrentStep as updateRAGVisualization } from "@/lib/simulationVisualizer";
import type {
  DeadlockStore,
  WfgSimulationResponse,
  MatrixSimulationResponse,
  RecoverySimulationResponse,
} from "@/types/deadlock";

// Create and export the deadlock store
export const useDeadlockStore = create<DeadlockStore>((set, get) => ({
  // Initialize state with default values
  isLoading: false,
  error: null,
  wfgSimulationResult: null,
  matrixSimulationResult: null,
  recoverySimulationResult: null,
  currentStep: 0,
  isAnimating: false,
  animationSpeed: 1000,
  animationTimer: null,
  simulationType: null,
  detectionType: null,
  totalSteps: 0,

  // Implementation of actions
  detectDeadlockWithWFG: async () => {
    // Reset state and clear previous results
    set({
      isLoading: true,
      error: null,
      currentStep: 0,
      simulationType: "wfg",
      detectionType: "wfg",
      wfgSimulationResult: null,
      matrixSimulationResult: null,
      recoverySimulationResult: null,
    });
    get().stopAnimation();
    useRAGStore.getState().clearGraph();

    const inputData: APIInputType = getAPIInput();
    inputData.simulation_id = "wfg_sim_frontend";

    try {
      // Make API request
      const response = await fetch("/api/wfg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Send only what WFG API expects
          available: inputData.available,
          allocation: inputData.allocation,
          request: inputData.request,
          simulation_id: inputData.simulation_id,
        }),
      });

      // Handle API errors
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
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
      const message =
        e instanceof Error ? e.message : "Failed to detect deadlock (WFG).";
      set({ error: message });
      console.error("WFG Deadlock detection error:", e);
    } finally {
      set({ isLoading: false });
    }
  },

  detectDeadlockWithMatrix: async () => {
    set({
      isLoading: true,
      error: null,
      currentStep: 0,
      simulationType: "matrix",
      detectionType: "matrix",
      wfgSimulationResult: null,
      matrixSimulationResult: null,
      recoverySimulationResult: null,
    });
    get().stopAnimation();
    useRAGStore.getState().clearGraph();

    const apiInput: APIInputType = getAPIInput();
    apiInput.simulation_id = "matrix_sim_frontend";

    try {
      // Make API request
      const response = await fetch("/api/matrix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
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
      const message =
        e instanceof Error
          ? e.message
          : "Failed to detect deadlock with matrix.";
      set({ error: message });
      console.error("Matrix deadlock detection error:", e);
    } finally {
      set({ isLoading: false });
    }
  },

  // Run RL-based deadlock recovery
  runDeadlockRecovery: async () => {
    const { detectionType } = get();
    set({
      isLoading: true,
      error: null,
      currentStep: 0,
      simulationType: "recovery",
      wfgSimulationResult: null,
      matrixSimulationResult: null,
      recoverySimulationResult: null,
    });
    get().stopAnimation();

    // Get input and pad to required dimensions
    const apiInput: APIInputType = getAPIInput();
    // Choose endpoint based on detection type
    const endpoint =
      detectionType === "wfg"
        ? "/api/deadlock_recovery_wfg"
        : "/api/deadlock_recovery";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          available: apiInput.available,
          allocation: apiInput.allocation,
          request: apiInput.request,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const result: RecoverySimulationResponse = await response.json();
      set({
        recoverySimulationResult: result,
        totalSteps: result.response?.length || 0,
      });
      // No RAG update needed for now
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to run deadlock recovery.";
      set({ error: message });
      console.error("Recovery simulation error:", e);
    } finally {
      set({ isLoading: false });
    }
  },

  // Update RAG visualization for current simulation step
  updateRAGForCurrentStep: () => {
    const { simulationType } = get();
    if (simulationType === "recovery") return; // Skip for recovery for now
    const { currentStep, wfgSimulationResult, matrixSimulationResult } = get();
    updateRAGVisualization(
      simulationType as "wfg" | "matrix" | null,
      currentStep,
      wfgSimulationResult,
      matrixSimulationResult
    );
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
