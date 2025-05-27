import type { Edge } from "@xyflow/react";
import { MarkerType } from "@xyflow/react";
import { useRAGStore } from '@/store/useRAGStore';
import type { WfgSimulationStep } from '@/types/deadlock';

/**
 * Converts RAG (Resource Allocation Graph) to WFG (Wait-For Graph)
 * This function transforms the resource allocation graph into a wait-for graph
 * by creating edges between processes that are waiting for resources held by other processes
 */
export function convertRAGToWFG(): void {
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
}

/**
 * Highlights a specific request edge in the RAG when a process requests a resource
 * @param processId - The ID of the requesting process (e.g., "P1")
 * @param resourceId - The ID of the requested resource (e.g., "R1")
 */
export function highlightRequestEdge(processId: string, resourceId: string): void {
  const ragStore = useRAGStore.getState();
  const currentNodes = ragStore.nodes;

  const currentEdges = ragStore.edges.map(edge => {
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
      } : {
        stroke: '#a1a1aa',
        strokeWidth: 2,
      },
      labelBgStyle: { fill: "#27272a" },
      labelStyle: { fill: "#e4e4e7" },
      labelBgPadding: [8, 4] as [number, number],
      labelBgBorderRadius: 4,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edge.data?.highlighted ? '#60a5fa' : '#a1a1aa',
      },
      data: { ...edge.data, highlighted: false }
    };
  });

  useRAGStore.getState().setGraph(currentNodes, currentEdges);
}

/**
 * Shows the default RAG view with cycle highlighting if detected
 */
export function showDefaultRAGView(): void {
  const ragStore = useRAGStore.getState();
  ragStore.clearGraph();
  ragStore.updateGraphFromSimulator();
}

// Track if we've converted to WFG in this simulation
let isInWFGMode = false;

/**
 * Updates the RAG visualization for WFG simulation steps
 * @param currentStepData - The current step data from the WFG simulation
 */
export function updateRAGForWFGStep(currentStepData: WfgSimulationStep): void {
  const action = currentStepData.action;

  if (action === "Converted RAG to WFG") {
    convertRAGToWFG();
    isInWFGMode = true;
  } else if (action.match(/P\d+ requested R\d+/) && !isInWFGMode) {
    // Only highlight RAG edges if we haven't converted to WFG yet
    const [processId, resourceId] = action.match(/P\d+|R\d+/g) || [];
    if (processId && resourceId) {
      highlightRequestEdge(processId, resourceId);
    }
  } else if (isInWFGMode) {
    // If we're in WFG mode, maintain the WFG visualization
    convertRAGToWFG();
  } else {
    // Default RAG view for initial steps
    showDefaultRAGView();
  }

  // Reset WFG mode flag for new simulations (when step is 0 or 1)
  if (currentStepData.step <= 1) {
    isInWFGMode = false;
  }
}