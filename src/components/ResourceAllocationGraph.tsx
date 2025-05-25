"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { nodeHeight, nodeWidth } from "../config/ragLayout";
import { useSimulatorStore } from "../store/useSimulatorStore";
import { Button } from "@/components/ui/button";
import { Maximize2Icon, Minimize2Icon } from "lucide-react";
import { useDeadlockStore } from "@/store/useDeadlockStore";

import useLayoutedElements from "@/hooks/useLayoutedElements";
import DetectionControls from "./DetectionControls";

const ResourceAllocationGraphInternal = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const graphContainerRef = useRef<HTMLDivElement>(null);

  const storeProcesses = useSimulatorStore((s) => s.processes);
  const storeResources = useSimulatorStore((s) => s.resources);
  const storeAllocations = useSimulatorStore((s) => s.allocations);
  const storeRequests = useSimulatorStore((s) => s.requests);

  // Get deadlock detection results
  const simulationResult = useDeadlockStore((s) => s.simulationResult);
  const cycleNodes = useMemo(() => simulationResult?.cycle_nodes || [], [simulationResult]);

  const [nodes, setNodesState, onNodesChangeInternal] = useNodesState<Node>([]);
  const [edges, setEdgesState, onEdgesChangeInternal] = useEdgesState<Edge>([]);

  const { getLayoutedElements } = useLayoutedElements();

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

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Auto-adjust layout when processes or resources change
  useEffect(() => {
    if (storeProcesses.length > 0 || storeResources.length > 0) {
      const timeoutId = setTimeout(() => {
        getLayoutedElements({ "elk.algorithm": "layered" });
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [storeProcesses, storeResources, getLayoutedElements]);

  // Auto-adjust layout when allocations or requests change
  useEffect(() => {
    if (storeAllocations.length > 0 || storeRequests.length > 0) {
      const timeoutId = setTimeout(() => {
        getLayoutedElements({ "elk.algorithm": "layered" });
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [storeAllocations, storeRequests, getLayoutedElements]);

  // Auto-adjust layout when WFG detection runs
  useEffect(() => {
    if (simulationResult) {
      const timeoutId = setTimeout(() => {
        getLayoutedElements({ "elk.algorithm": "layered" });
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [simulationResult, getLayoutedElements]);

  // Memoize the node creation function
  const createNodes = useCallback(() => {
    return [
      ...storeProcesses.map((p, index) => ({
        id: p.id,
        data: { label: `P${index}` },
        position: { x: Math.random() * 200, y: Math.random() * 100 },
        style: {
          width: nodeWidth,
          height: nodeHeight,
          borderRadius: "50%",
          border: cycleNodes.includes(p.id)
            ? "3px solid #ef4444"
            : "3px solid #60a5fa",
          background: cycleNodes.includes(p.id)
            ? "#991b1b"
            : "#1e3a8a",
          boxShadow:
            "0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -2px rgba(0,0,0,0.3)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "16px",
          fontWeight: "bold",
          color: "#dbeafe",
        },
        type: "default",
      })),
      ...storeResources.map((r, index) => ({
        id: r.id,
        data: {
          label: (
            <div className="text-center">
              <div className="font-bold text-emerald-300">R{index}</div>
              <div className="text-sm text-emerald-200">{r.total}</div>
            </div>
          ),
        },
        position: { x: Math.random() * 200, y: Math.random() * 100 + 200 },
        style: {
          width: nodeWidth,
          height: nodeHeight,
          borderRadius: "12px",
          border: cycleNodes.includes(r.id)
            ? "3px solid #ef4444"
            : "3px solid #34d399",
          background: cycleNodes.includes(r.id)
            ? "#991b1b"
            : "#065f46",
          boxShadow:
            "0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -2px rgba(0,0,0,0.3)",
          padding: "4px",
        },
        type: "default",
      })),
    ];
  }, [storeProcesses, storeResources, cycleNodes]);

  // Memoize the edge creation function
  const createEdges = useCallback(() => {
    const isEdgeInCycle = (source: string, target: string) => {
      return cycleNodes.includes(source) || cycleNodes.includes(target);
    };

    return [
      ...storeAllocations.map((a) => ({
        id: `alloc-${a.processId}-${a.resourceId}-${a.amount}`,
        source: a.resourceId,
        target: a.processId,
        label: `${a.amount}`,
        animated: false,
        style: {
          stroke: isEdgeInCycle(a.resourceId, a.processId) ? "#ef4444" : "#a1a1aa",
          strokeWidth: isEdgeInCycle(a.resourceId, a.processId) ? 3 : 2
        },
        labelBgStyle: { fill: "#27272a" },
        labelStyle: { fill: "#e4e4e7" },
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 4,
        type: "default",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isEdgeInCycle(a.resourceId, a.processId) ? "#ef4444" : "#a1a1aa"
        },
      })),
      ...storeRequests.map((r) => ({
        id: `req-${r.processId}-${r.resourceId}-${r.amount}`,
        source: r.processId,
        target: r.resourceId,
        label: `${r.amount}`,
        animated: true,
        style: {
          stroke: isEdgeInCycle(r.processId, r.resourceId) ? "#ef4444" : "#a1a1aa",
          strokeWidth: isEdgeInCycle(r.processId, r.resourceId) ? 3 : 2
        },
        labelBgStyle: { fill: "#27272a" },
        labelStyle: { fill: "#e4e4e7" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isEdgeInCycle(r.processId, r.resourceId) ? "#ef4444" : "#a1a1aa"
        },
        type: "default",
      })),
    ];
  }, [storeAllocations, storeRequests, cycleNodes]);

  // Update nodes and edges
  useEffect(() => {
    setNodesState(createNodes());
  }, [createNodes, setNodesState]);

  useEffect(() => {
    setEdgesState(createEdges());
  }, [createEdges, setEdgesState]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChangeInternal(changes);
    },
    [onNodesChangeInternal]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChangeInternal(changes);
    },
    [onEdgesChangeInternal]
  );

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
            {isFullscreen ? (
              <Minimize2Icon className="h-4 w-4" />
            ) : (
              <Maximize2Icon className="h-4 w-4" />
            )}
          </Button>
          <Button
            onClick={() => getLayoutedElements({ "elk.algorithm": "layered" })}
            variant="outline"
            size="sm"
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-600"
          >
            Adjust Layout
          </Button>
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          colorMode="dark"
          fitView
          minZoom={0.5}
          maxZoom={2}
        >
          <Background
            color="#3f3f46"
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
          />
          <Controls
            showInteractive={true}
            className="bg-zinc-800 text-zinc-200 shadow-lg rounded-lg"
          />
        </ReactFlow>
      </div>
    </div>
  );
};

const ResourceAllocationGraph = () => {
  return (
    <ReactFlowProvider>
      <ResourceAllocationGraphInternal />
    </ReactFlowProvider>
  );
};

export default ResourceAllocationGraph;
