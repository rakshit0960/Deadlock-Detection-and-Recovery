"use client";

import { Button } from "@/components/ui/button";
import { nodeHeight, nodeWidth } from "@/config/ragLayout";
import useLayoutedElements from "@/hooks/useLayoutedElements";
import { useDeadlockStore } from "@/store/useDeadlockStore";
import { useRAGStore } from "@/store/useRAGStore";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Maximize2Icon, Minimize2Icon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DetectionControls from "./DetectionControls";

const ResourceAllocationGraphInternal = () => {

  const [isFullscreen, setIsFullscreen] = useState(false);
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();

  // Get RAG state from the global RAG store
  const ragNodes = useRAGStore((s) => s.nodes);
  const ragEdges = useRAGStore((s) => s.edges);
  const updateNodePosition = useRAGStore((s) => s.updateNodePosition);


  // Get simulation type and current step from Deadlock store
  const simulationType = useDeadlockStore((s) => s.simulationType);
  const currentStep = useDeadlockStore((s) => s.currentStep);
  const matrixSimulationResult = useDeadlockStore((s) => s.matrixSimulationResult);
  const wfgSimulationResult = useDeadlockStore((s) => s.wfgSimulationResult);
  const currentSimulationResult = simulationType === 'matrix' ? matrixSimulationResult : wfgSimulationResult;

  const cycleNodes = useMemo(() =>
    wfgSimulationResult?.cycle_nodes || [],
    [wfgSimulationResult]
  );

  const { getLayoutedElements } = useLayoutedElements();

  // Refs to track previous nodes and edges for structure change detection
  const prevNodes = useRef(ragNodes);
  const prevEdges = useRef(ragEdges);

  // Memoize styled nodes
  const styledNodes = useMemo(() =>
    ragNodes.map(node => {
      const isProcess = node.type === 'process';
      const inCycle = cycleNodes.includes(node.id);

      return {
        ...node,
        style: {
          width: nodeWidth,
          height: nodeHeight,
          borderRadius: isProcess ? "50%" : "12px",
          border: inCycle
            ? "3px solid #ef4444"
            : isProcess
              ? "3px solid #60a5fa"
              : "3px solid #34d399",
          background: inCycle
            ? "#991b1b"
            : isProcess
              ? "#1e3a8a"
              : "#065f46",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -2px rgba(0,0,0,0.3)",
          display: isProcess ? "flex" : "block",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "16px",
          fontWeight: "bold",
          color: "#dbeafe",
          padding: isProcess ? "0" : "4px",
        },
        data: {
          ...node.data,
          label: isProcess
            ? node.data.label
            : (
              <div className="text-center">
                <div className="font-bold text-emerald-300">R{node.data.index as number}</div>
                <div className="text-sm text-emerald-200">{node.data.total as number}</div>
              </div>
            ),
        },
      };
    }), [ragNodes, cycleNodes]
  );

  // Handle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      graphContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Initial load and RAGStore changes
  useEffect(() => {
    // Helper function to check if graph structure changed (ignoring positions)
    const hasGraphStructureChanged = (prevNodes: Node[], prevEdges: Edge[], newNodes: Node[], newEdges: Edge[]) => {
      if (prevNodes.length !== newNodes.length || prevEdges.length !== newEdges.length) return true;

      // Check if node IDs or data changed
      const nodesChanged = newNodes.some((newNode, i) => {
        const prevNode = prevNodes[i];
        return !prevNode ||
          prevNode.id !== newNode.id ||
          JSON.stringify(prevNode.data) !== JSON.stringify(newNode.data);
      });

      // Check if edge structure changed
      const edgesChanged = newEdges.some((newEdge, i) => {
        const prevEdge = prevEdges[i];
        return !prevEdge ||
          prevEdge.id !== newEdge.id ||
          prevEdge.source !== newEdge.source ||
          prevEdge.target !== newEdge.target ||
          JSON.stringify(prevEdge.data) !== JSON.stringify(newEdge.data);
      });

      return nodesChanged || edgesChanged;
    };

    if ((ragNodes.length > 0 || ragEdges.length > 0) &&
      hasGraphStructureChanged(prevNodes.current, prevEdges.current, ragNodes, ragEdges)) {
      const timeoutId = setTimeout(() => {
        getLayoutedElements({ "elk.algorithm": "layered" }, ragNodes, ragEdges);
        fitView({ duration: 200 });
      }, 100);

      prevNodes.current = ragNodes;
      prevEdges.current = ragEdges;
      return () => clearTimeout(timeoutId);
    }
  }, [ragNodes, ragEdges, getLayoutedElements, fitView]);

  // Update graph when simulator state changes
  useEffect(() => {
    useRAGStore.getState().updateGraphFromSimulator();
  }, []);

  // Auto-adjust layout when simulation starts
  useEffect(() => {
    if (currentSimulationResult && currentStep === 0) {
      const timeoutId = setTimeout(() => {
        getLayoutedElements({ "elk.algorithm": "layered" }, ragNodes, ragEdges);
        fitView({ duration: 200 });
      }, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [currentSimulationResult, currentStep, getLayoutedElements, ragNodes, ragEdges, fitView]);

  // Persist node positions on drag
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          updateNodePosition(change.id, change.position);
        }
      });
    },
    [updateNodePosition]
  );

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    // Handle edge changes if needed
    console.log("Edge changes:", changes);
  }, []);

  return (
    <div>
      <DetectionControls />
      <div
        ref={graphContainerRef}
        className={`relative border border-border rounded-lg bg-[#18181b] ${isFullscreen ? "w-screen h-screen" : "w-full h-[700px]"
          }`}
      >
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          <Button
            onClick={toggleFullscreen}
            variant="outline"
            size="sm"
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-600"
          >
            {isFullscreen ? <Minimize2Icon className="h-4 w-4" /> : <Maximize2Icon className="h-4 w-4" />}
          </Button>
          <Button
            onClick={() => getLayoutedElements({ "elk.algorithm": "layered" }, ragNodes, ragEdges)}
            variant="outline"
            size="sm"
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-600"
            disabled={ragNodes.length === 0}
          >
            Adjust Layout
          </Button>
        </div>
        <ReactFlow
          nodes={styledNodes}
          edges={ragEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          colorMode="dark"
          fitView
          minZoom={0.5}
          maxZoom={2}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
        >
          <Background color="#3f3f46" variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls showInteractive={true} className="bg-zinc-800 text-zinc-200 shadow-lg rounded-lg" />
        </ReactFlow>
      </div>
    </div>
  );
};

const ResourceAllocationGraph = () => (
  <ReactFlowProvider>
    <ResourceAllocationGraphInternal />
  </ReactFlowProvider>
);

export default ResourceAllocationGraph;
