import { create } from 'zustand';
import { getAPIInput } from '@/lib/utils';

export interface SimulationStep {
  step: number;
  action: string;
  graph: Record<string, string[]>;
}

export interface DeadlockSimulationResponse {
  deadlocked: boolean;
  cycle_nodes: string[];
  simulation: {
    simulation_id: string;
    steps: SimulationStep[];
  } | null;
}

interface DeadlockStore {
  // State
  isLoading: boolean;
  error: string | null;
  simulationResult: DeadlockSimulationResponse | null;
  currentStep: number;
  isAnimating: boolean;
  animationSpeed: number;
  animationTimer: NodeJS.Timeout | null;

  // Actions
  detectDeadlockWithWFG: () => Promise<void>;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  startAnimation: () => void;
  stopAnimation: () => void;
  setSpeed: (speed: number) => void;

  // Computed
  getCurrentStepData: () => SimulationStep | null;
  totalSteps: number;
}

export const useDeadlockStore = create<DeadlockStore>((set, get) => ({
  // Initial state
  isLoading: false,
  error: null,
  simulationResult: null,
  currentStep: 0,
  isAnimating: false,
  animationSpeed: 1000,
  animationTimer: null,
  totalSteps: 0,

  // Actions
  detectDeadlockWithWFG: async () => {
    set({ isLoading: true, error: null, currentStep: 0 });
    get().stopAnimation();

    const inputData = getAPIInput();
    inputData.simulation_id = "wfg_sim_frontend";

    try {
      const response = await fetch('/api/wfg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result: DeadlockSimulationResponse = await response.json();
      set({
        simulationResult: result,
        totalSteps: result.simulation?.steps?.length || 0
      });
    } catch (e) {
      if (e instanceof Error) {
        set({ error: e.message || 'Failed to detect deadlock.' });
      } else {
        set({ error: 'Failed to detect deadlock.' });
      }
      console.error("Deadlock detection error:", e);
    } finally {
      set({ isLoading: false });
    }
  },

  goToStep: (step) => {
    const { simulationResult } = get();
    if (!simulationResult?.simulation?.steps) return;

    const totalSteps = simulationResult.simulation.steps.length;
    const validStep = Math.max(0, Math.min(step, totalSteps - 1));
    set({ currentStep: validStep });
  },

  nextStep: () => {
    const { currentStep, goToStep, simulationResult } = get();
    if (!simulationResult?.simulation?.steps) return;

    goToStep(currentStep + 1);
  },

  prevStep: () => {
    const { currentStep, goToStep, simulationResult } = get();
    if (!simulationResult?.simulation?.steps) return;

    goToStep(currentStep - 1);
  },

  startAnimation: () => {
    const { simulationResult, isAnimating, animationSpeed } = get();
    if (!simulationResult?.simulation?.steps || isAnimating) return;

    set({ isAnimating: true });

    const timer = setInterval(() => {
      const { currentStep, simulationResult } = get();
      const nextStep = currentStep + 1;
      const totalSteps = simulationResult!.simulation!.steps.length;

      if (nextStep >= totalSteps) {
        clearInterval(timer);
        set({ isAnimating: false });
        return;
      }

      set({ currentStep: nextStep });
    }, animationSpeed);

    set({ animationTimer: timer });
  },

  stopAnimation: () => {
    const { animationTimer } = get();
    if (animationTimer) {
      clearInterval(animationTimer);
    }
    set({ isAnimating: false, animationTimer: null });
  },

  setSpeed: (speed) => {
    const { isAnimating, animationTimer } = get();
    set({ animationSpeed: speed });

    if (isAnimating && animationTimer) {
      clearInterval(animationTimer);

      const timer = setInterval(() => {
        const { currentStep, simulationResult } = get();
        const nextStep = currentStep + 1;
        const totalSteps = simulationResult!.simulation!.steps.length;

        if (nextStep >= totalSteps) {
          clearInterval(timer);
          set({ isAnimating: false });
          return;
        }

        set({ currentStep: nextStep });
      }, speed);

      set({ animationTimer: timer });
    } 
  },

  getCurrentStepData: () => {
    const { simulationResult, currentStep } = get();
    if (!simulationResult?.simulation?.steps || simulationResult.simulation.steps.length === 0) {
      return null;
    }

    return simulationResult.simulation.steps[currentStep];
  },
}));