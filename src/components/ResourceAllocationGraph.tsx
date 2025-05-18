"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  OnEdgesChange,
  OnNodesChange,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useRef } from 'react';
import { nodeHeight, nodeWidth } from '../config/ragLayout';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { Button } from "@/components/ui/button";

import useLayoutedElements from '@/hooks/useLayoutedElements';



const ResourceAllocationGraphInternal = () => {
  const storeProcesses = useSimulatorStore((s) => s.processes);
  const storeResources = useSimulatorStore((s) => s.resources);
  const storeAllocations = useSimulatorStore((s) => s.allocations);
  const storeRequests = useSimulatorStore((s) => s.requests);

  const [nodes, setNodesState, onNodesChangeInternal] = useNodesState<Node>([]);
  const [edges, setEdgesState, onEdgesChangeInternal] = useEdgesState<Edge>([]);

  const { getLayoutedElements } = useLayoutedElements();

  // Refs to track previous counts and initial layout for updating the layout when nodes or edges are changed
  const initialLayoutDone = useRef(false);
  const prevNodeCount = useRef(0);
  const prevEdgeCount = useRef(0);

  useEffect(() => {
    const newNodes: Node[] = [
      ...storeProcesses.map((p) => ({
        id: p.id,
        data: { label: p.id },
        position: { x: Math.random() * 200, y: Math.random() * 100 },
        style: {
          width: nodeWidth,
          height: nodeHeight,
          borderRadius: '50%',
          border: '3px solid #60a5fa',
          background: '#1e3a8a',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -2px rgba(0,0,0,0.3)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#dbeafe',
        },
        type: 'default',
      })),
      ...storeResources.map((r) => ({
        id: r.id,
        data: {
          label: (
            <div className="text-center">
              <div className="font-bold text-emerald-300">{r.id}</div>
              <div className="text-sm text-emerald-200">{r.total}</div>
            </div>
          ),
        },
        position: { x: Math.random() * 200, y: Math.random() * 100 + 200 },
        style: {
          width: nodeWidth,
          height: nodeHeight,
          borderRadius: '12px',
          border: '3px solid #34d399',
          background: '#065f46',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -2px rgba(0,0,0,0.3)',
          padding: '4px',
        },
        type: 'default',
      })),
    ];
    setNodesState(newNodes);
  }, [storeProcesses, storeResources, setNodesState]);

  useEffect(() => {
    const newEdges: Edge[] = [
      ...storeAllocations.map((a) => ({
        id: `alloc-${a.processId}-${a.resourceId}-${a.amount}`,
        source: a.resourceId,
        target: a.processId,
        label: `${a.amount}`,
        animated: false,
        style: { stroke: '#a1a1aa', strokeWidth: 2 },
        labelBgStyle: { fill: '#27272a' },
        labelStyle: { fill: '#e4e4e7' },
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 4,
        type: 'default',
        markerEnd: { type: MarkerType.ArrowClosed, color: '#a1a1aa' },
      })),
      ...storeRequests.map((r) => ({
        id: `req-${r.processId}-${r.resourceId}-${r.amount}`,
        source: r.processId,
        target: r.resourceId,
        label: `${r.amount}`,
        animated: true,
        style: { stroke: '#a1a1aa', strokeWidth: 2 },
        labelBgStyle: { fill: '#27272a' },
        labelStyle: { fill: '#e4e4e7' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#a1a1aa' },
        type: 'default',
      })),
    ];
    setEdgesState(newEdges);
  }, [storeAllocations, storeRequests, setEdgesState]);

  useEffect(() => {
    const currentNodeCount = nodes.length;
    const currentEdgeCount = edges.length;

    if (!initialLayoutDone.current && currentNodeCount > 0) {
      // Perform initial layout
      getLayoutedElements({ 'elk.algorithm': 'layered' });
      initialLayoutDone.current = true;
    } else if (
      initialLayoutDone.current &&
      (currentNodeCount !== prevNodeCount.current || currentEdgeCount !== prevEdgeCount.current) &&
      currentNodeCount > 0 // Ensure we don't layout if all nodes are removed
    ) {
      // Perform layout if number of nodes or edges changes
      getLayoutedElements({ 'elk.algorithm': 'layered' });
    }

    // Update previous counts
    prevNodeCount.current = currentNodeCount;
    prevEdgeCount.current = currentEdgeCount;
  }, [nodes, edges, getLayoutedElements]);


  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChangeInternal(changes);
    },
    [onNodesChangeInternal]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChangeInternal(changes);
      // Layout is now handled by the useEffect watching nodes and edges counts
    },
    [onEdgesChangeInternal]
  );

  return (
    <div style={{ position: 'relative', width: '100%', height: '500px', border: '1px solid #3f3f46', borderRadius: '8px', backgroundColor: '#18181b' }}>
      <Button
        onClick={() => getLayoutedElements({ 'elk.algorithm': 'layered' })}
        variant="outline"
        size="sm"
        className="cursor-pointer absolute top-2 right-2 z-10 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-600"
      >
        Adjust Layout
      </Button>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        colorMode='dark'
        fitView
        minZoom={0.5}
        maxZoom={2}
      >
        <Background color="#3f3f46" variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls
          showInteractive={true}
          className="bg-zinc-800 text-zinc-200 shadow-lg rounded-lg"
        />
      </ReactFlow>
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