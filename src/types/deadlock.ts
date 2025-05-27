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

// Response interface for Recovery simulation (RL-based)
export interface RecoverySimulationStep {
  step: number;
  action: string;
  result?: string;
}

export interface RecoverySimulationResponse {
  simulation_id: string;
  steps: RecoverySimulationStep[];
  response: string[]; // Raw textual output from backend render()
}

// Main store interface defining state and actions
export interface DeadlockStore {
  // State properties
  isLoading: boolean;                                        // Loading state flag
  error: string | null;                                      // Error message if any
  wfgSimulationResult: WfgSimulationResponse | null;         // WFG simulation results
  matrixSimulationResult: MatrixSimulationResponse | null;   // Matrix simulation results
  currentStep: number;                                       // Current step in simulation
  isAnimating: boolean;                                      // Animation state
  animationSpeed: number;                                    // Animation speed in ms
  animationTimer: NodeJS.Timeout | null;                     // Timer for animation
  recoverySimulationResult: RecoverySimulationResponse | null; // Recovery simulation results
  simulationType: 'wfg' | 'matrix' | 'recovery' | null;      // Current simulation type

  // Detection type of last detection run (wfg or matrix)
  detectionType: 'wfg' | 'matrix' | null;

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
  runDeadlockRecovery: () => Promise<void>;                 // Run Recovery simulation

  // Computed values
  totalSteps: number;                                       // Total steps in simulation
}