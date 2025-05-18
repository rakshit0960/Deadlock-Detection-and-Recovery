// Client-side only component
"use client";

// Import layout configuration and node dimensions
import { elkLayoutOptionsBase, nodeHeight } from '@/config/ragLayout';
import { nodeWidth } from '@/config/ragLayout';
import {
  useReactFlow,
  type Edge,
  type Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ELK, { ElkExtendedEdge, ElkNode, LayoutOptions } from 'elkjs/lib/elk.bundled.js';
import { useCallback, useRef } from 'react';

// Initialize ELK layout engine
export const elk = new ELK();

// Hook for handling automatic layout of graph elements
export default function useLayoutedElements() {
  // Get React Flow utilities
  const { getNodes, setNodes, getEdges, fitView } = useReactFlow();
  // Flag to prevent concurrent layout operations
  const isLayouting = useRef(false);

  // Function to calculate and apply layout to graph elements
  const getLayoutedElements = useCallback(
    async (options: LayoutOptions, nodesToLayoutParam?: Node[], edgesToLayoutParam?: Edge[]) => {
      // Prevent concurrent layout operations
      if (isLayouting.current) return;
      isLayouting.current = true;

      // Use provided nodes/edges or get current ones from React Flow
      const nodesForElk = nodesToLayoutParam || getNodes();
      const edgesForElk = edgesToLayoutParam || getEdges();

      // Exit if there are no nodes to layout
      if (nodesForElk.length === 0) {
        isLayouting.current = false;
        return;
      }

      // Prepare graph structure for ELK
      const graph: ElkNode = {
        id: 'root',
        layoutOptions: { ...elkLayoutOptionsBase, ...options },
        // Convert React Flow nodes to ELK format
        children: nodesForElk.map((node) => ({
          id: node.id,
          width: node.measured?.width || node.style?.width as number || nodeWidth,
          height: node.measured?.height || node.style?.height as number || nodeHeight,
        })),
        // Convert React Flow edges to ELK format
        edges: edgesForElk.map(edge => ({
          id: edge.id,
          sources: [edge.source],
          targets: [edge.target],
        })) as ElkExtendedEdge[],
      };

      try {
        // Calculate layout using ELK
        const layoutedGraph = await elk.layout(graph);
        if (layoutedGraph.children) {
          // Apply calculated positions to React Flow nodes
          const updatedNodes = getNodes().map(currentRfNode => {
            const elkNode = layoutedGraph.children?.find(n => n.id === currentRfNode.id);
            if (elkNode) {
              return {
                ...currentRfNode,
                position: { x: elkNode.x ?? 0, y: elkNode.y ?? 0 },
              };
            }
            return currentRfNode;
          });
          // Update node positions and fit view
          setNodes(updatedNodes);
          fitView({ duration: 0, padding: 0.2 });
        }
      } catch (e) {
        console.error("Error during ELK layout:", e);
      } finally {
        // Reset layout flag
        isLayouting.current = false;
      }
    },
    [getNodes, setNodes, getEdges, fitView]
  );

  return { getLayoutedElements };
};