import { updateRAGForWFGStep } from './wfgSimulationUtils';
import { updateRAGForMatrixStep } from './matrixSimulationUtils';
import type { WfgSimulationResponse, MatrixSimulationResponse } from '@/types/deadlock';

/**
 * Main function that updates RAG visualization based on current simulation step
 * This function delegates to specific handlers for WFG and Matrix simulations
 *
 * @param simulationType - The type of simulation ('wfg' or 'matrix')
 * @param currentStep - The current step number in the simulation
 * @param wfgResult - WFG simulation result data (if applicable)
 * @param matrixResult - Matrix simulation result data (if applicable)
 */
export function updateRAGForCurrentStep(
  simulationType: 'wfg' | 'matrix' | null,
  currentStep: number,
  wfgResult: WfgSimulationResponse | null,
  matrixResult: MatrixSimulationResponse | null
): void {
  if (simulationType === 'wfg' && wfgResult?.simulation?.steps) {
    const currentStepData = wfgResult.simulation.steps[currentStep];
    updateRAGForWFGStep(currentStepData);
  } else if (simulationType === 'matrix' && matrixResult?.simulation?.steps) {
    const currentStepData = matrixResult.simulation.steps[currentStep];
    updateRAGForMatrixStep(currentStepData);
  }
}