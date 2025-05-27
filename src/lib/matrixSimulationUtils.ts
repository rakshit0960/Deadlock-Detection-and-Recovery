import { useRAGStore } from '@/store/useRAGStore';
import type { MatrixSimulationStep } from '@/types/deadlock';

/**
 * Shows the initial RAG state for matrix simulation
 */
export function showInitialMatrixState(): void {
  useRAGStore.getState().updateGraphFromSimulator();
}

/**
 * Handles process completion visualization in matrix simulation
 * @param finishedProcessId - The ID of the process that finished (e.g., "P1")
 * @param currentStepData - The current step data from the matrix simulation
 */
export function handleProcessCompletion(finishedProcessId: string, currentStepData: MatrixSimulationStep): void {
  const ragStore = useRAGStore.getState();

  // Get all nodes except the finished process
  const remainingNodes = ragStore.nodes.filter(node =>
    node.id !== finishedProcessId && node.type !== 'resource'
  );

  // Keep all resource nodes
  const resourceNodes = ragStore.nodes.filter(node => node.type === 'resource').map(node => ({
    ...node,
    style: {
      ...node.style,
      opacity: 1
    }
  }));

  // Get all edges except those connected to the finished process
  const remainingEdges = ragStore.edges.filter(edge =>
    edge.source !== finishedProcessId && edge.target !== finishedProcessId
  ).map(edge => ({
    ...edge,
    style: {
      ...edge.style,
      opacity: 1
    }
  }));

  // Update work vector visualization if available
  if (currentStepData.work) {
    resourceNodes.forEach((node) => {
      const workAmount = currentStepData.work?.[parseInt(node.id.slice(1))];
      if (workAmount !== undefined) {
        node.data = {
          ...node.data,
          work: workAmount
        };
      }
    });
  }

  // Highlight finished processes in the finish vector
  const updatedNodes = [...resourceNodes, ...remainingNodes].map(node => {
    if (node.type === 'process' && currentStepData.finish?.[parseInt(node.id.slice(1))]) {
      return {
        ...node,
        style: {
          ...node.style,
          backgroundColor: '#22c55e',
          color: 'white'
        }
      };
    }
    return node;
  });

  // Set the updated graph with removed node
  useRAGStore.getState().setGraph(updatedNodes, remainingEdges);
}

/**
 * Shows the final state of the matrix simulation with deadlock/no-deadlock visualization
 * @param result - The result message from the simulation step
 */
export function showFinalMatrixState(result: string): void {
  const isDeadlocked = result !== "No Deadlock";
  const ragStore = useRAGStore.getState();

  // Update node styles based on final state
  const finalNodes = ragStore.nodes.map(node => ({
    ...node,
    style: {
      ...node.style,
      backgroundColor: isDeadlocked ? '#ef4444' : '#22c55e',
      color: 'white',
      opacity: 1
    }
  }));

  // Update edge styles based on final state
  const finalEdges = ragStore.edges.map(edge => ({
    ...edge,
    style: {
      ...edge.style,
      stroke: isDeadlocked ? '#ef4444' : '#22c55e',
      opacity: 1
    },
    animated: isDeadlocked
  }));

  useRAGStore.getState().setGraph(finalNodes, finalEdges);
}

/**
 * Updates the RAG visualization for Matrix simulation steps
 * @param currentStepData - The current step data from the Matrix simulation
 */
export function updateRAGForMatrixStep(currentStepData: MatrixSimulationStep): void {
  const action = currentStepData.action;

  // Initial state - show the full RAG
  if (action === "Initial State") {
    showInitialMatrixState();
    return;
  }

  // Process completion step
  const processMatch = action.match(/Process P(\d+) can finish/);
  if (processMatch) {
    const finishedProcessId = `P${processMatch[1]}`;
    handleProcessCompletion(finishedProcessId, currentStepData);
    return;
  }

  // Final step - show completion message
  if (action === "Deadlock Check Completed") {
    const result = currentStepData.result;
    if (result) {
      showFinalMatrixState(result);
    }
  }
}