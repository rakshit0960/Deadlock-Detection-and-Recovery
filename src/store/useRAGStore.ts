import type { Edge, Node } from "@xyflow/react";
import { MarkerType } from "@xyflow/react";
import { create } from "zustand";
import { useSimulatorStore } from "./useSimulatorStore";

interface RAGStore {
  nodes: Node[];
  edges: Edge[];
  setGraph: (nodes: Node[], edges: Edge[]) => void;
  clearGraph: () => void;
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  getNodePosition: (nodeId: string) => { x: number; y: number } | undefined;
  updateGraphFromSimulator: () => void;
}

export const useRAGStore = create<RAGStore>((set, get) => ({
  nodes: [],
  edges: [],

  setGraph: (newNodes, newEdges) => {
    const currentNodes = get().nodes;
    const currentEdges = get().edges;

    // Helper function to check if only positions have changed
    const onlyPositionsChanged = () => {
      if (currentNodes.length !== newNodes.length) return false;

      return newNodes.every((newNode, i) => {
        const currentNode = currentNodes[i];
        if (!currentNode || currentNode.id !== newNode.id) return false;

        // Check if everything except position is the same
        const newNodeWithoutPos = { ...newNode, position: undefined };
        const currentNodeWithoutPos = { ...currentNode, position: undefined };
        return JSON.stringify(newNodeWithoutPos) === JSON.stringify(currentNodeWithoutPos);
      });
    };

    const edgesChanged =
      currentEdges.length !== newEdges.length ||
      newEdges.some(
        (newEdge, i) =>
          currentEdges[i]?.id !== newEdge.id ||
          JSON.stringify(currentEdges[i]?.data) !== JSON.stringify(newEdge.data)
      );

    // If only positions changed, just update positions
    if (!edgesChanged && onlyPositionsChanged()) {
      const positionedNodes = newNodes.map((node) => ({
        ...node,
        position: node.position || get().getNodePosition(node.id) || {
          x: Math.random() * 200,
          y: Math.random() * 200,
        },
      }));
      set({ nodes: positionedNodes });
      return;
    }

    // If structure changed, ensure all nodes have positions
    const positionedNodes = newNodes.map((node) => ({
      ...node,
      position:
        node.position || get().getNodePosition(node.id) || {
          x: Math.random() * 200,
          y: Math.random() * 200,
        },
    }));
    set({ nodes: positionedNodes, edges: newEdges });
  },

  clearGraph: () => set({ nodes: [], edges: [] }),

  updateNodePosition: (nodeId, position) => {
    set((state) => {
      let positionActuallyChanged = false;
      const newNodes = state.nodes.map((node) => {
        if (node.id === nodeId) {
          if (node.position?.x !== position.x || node.position?.y !== position.y) {
            positionActuallyChanged = true;
            return { ...node, position };
          }
        }
        return node;
      });
      // Only update state if the position truly changed to prevent infinite loops
      return positionActuallyChanged ? { nodes: newNodes } : state;
    });
  },

  getNodePosition: (nodeId: string) => {
    return get().nodes.find((node) => node.id === nodeId)?.position;
  },

  updateGraphFromSimulator: () => {
    const processes = useSimulatorStore.getState().processes;
    const resources = useSimulatorStore.getState().resources;
    const allocations = useSimulatorStore.getState().allocations;
    const requests = useSimulatorStore.getState().requests;

    // Create a map of existing node positions
    const existingPositions = new Map(
      get().nodes.map(node => [node.id, node.position])
    );

    const nodes: Node[] = [
      ...processes.map((p) => {
        const processNum = parseInt(p.id.substring(1));
        return {
          id: p.id,
          type: "process",
          data: { label: `P${processNum}`, index: processNum },
          position: existingPositions.get(p.id) || {
            x: Math.random() * 200,
            y: Math.random() * 100,
          },
        };
      }),

      ...resources.map((r) => {
        const resourceNum = parseInt(r.id.substring(1));
        return {
          id: r.id,
          type: "resource",
          data: { label: `R${resourceNum}`, index: resourceNum, total: r.total },
          position: existingPositions.get(r.id) || {
            x: Math.random() * 200,
            y: Math.random() * 100 + 200,
          },
        };
      }),
    ];

    const edges: Edge[] = [
      ...allocations.map((a) => ({
        id: `alloc-${a.processId}-${a.resourceId}-${a.amount}`,
        source: a.resourceId,
        target: a.processId,
        type: "allocation",
        data: { amount: a.amount },
        animated: false,
        style: {
          stroke: "#a1a1aa",
          strokeWidth: 2,
        },
        labelBgStyle: { fill: "#27272a" },
        labelStyle: { fill: "#e4e4e7" },
        labelBgPadding: [8, 4] as [number, number],
        labelBgBorderRadius: 4,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#a1a1aa",
        },
      })),
      ...requests.map((r) => ({
        id: `req-${r.processId}-${r.resourceId}-${r.amount}`,
        source: r.processId,
        target: r.resourceId,
        type: "request",
        data: { amount: r.amount },
        animated: true,
        style: {
          stroke: "#a1a1aa",
          strokeWidth: 2,
        },
        labelBgStyle: { fill: "#27272a" },
        labelStyle: { fill: "#e4e4e7" },
        labelBgPadding: [8, 4] as [number, number],
        labelBgBorderRadius: 4,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#a1a1aa",
        },
      })),
    ];

    set({ nodes, edges });
  },
}));
