"use client";

import { addEdge, applyEdgeChanges, applyNodeChanges, Background, BackgroundVariant, Controls, OnConnect, OnEdgesChange, OnNodesChange, ReactFlow, type Edge, type Node, ReactFlowInstance, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useState } from 'react';
import { useSimulatorStore } from '../store/useSimulatorStore';

const nodeWidth = 50;
const nodeHeight = 50;

const ResourceAllocationGraph = () => {
  const processes = useSimulatorStore((s) => s.processes);
  const resources = useSimulatorStore((s) => s.resources);
  const allocations = useSimulatorStore((s) => s.allocations);
  const requests = useSimulatorStore((s) => s.requests);
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance | null>(null);

  // Layout: arrange processes in a row, resources in another row
  const [nodes, setNodes] = useState<Node[]>([]);
  useEffect(() => {
    setNodes([
      ...processes.map((p, i) =>
        {
          const existingNode = nodes.find((n) => n.id === p.id);
          return {
            id: p.id,
            data: { label: p.id },
            position: existingNode?.position || { x: i * (nodeWidth + 80), y: 0 }, // Preserve position if node exists
            style: {
              width: nodeWidth,
              height: nodeHeight,
              borderRadius: '50%',
              border: '3px solid #60a5fa', // lighter blue (blue-400)
              background: '#1e3a8a', // dark blue (blue-800)
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -2px rgba(0,0,0,0.3)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#dbeafe' // light blue text (blue-100)
            },
            type: 'process',
          };
    }),
      ...resources.map((r, i) => {
        const existingNode = nodes.find((n) => n.id === r.id);
        return {
          id: r.id,
          data: {
            label: <div className="text-center">
            <div className="font-bold text-emerald-300">{r.id}</div> {/* Lighter green */}
            <div className="text-sm text-emerald-200">{r.total}</div> {/* Even lighter green */}
          </div>
        },
        position: existingNode?.position || { x: i * (nodeWidth + 80) + 80, y: 180 }, // Preserve position
        style: {
          width: nodeWidth,
          height: nodeHeight,
          borderRadius: '12px',
          border: '3px solid #34d399', // lighter green (emerald-400)
          background: '#065f46', // dark green (emerald-700)
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -2px rgba(0,0,0,0.3)',
          padding: '4px'
        },
        type: 'resource',
      };
    }),
    ]);

    // Fit view after nodes update
    setTimeout(() => {
      flowInstance?.fitView();
    }, 0);
  }, [processes, resources, flowInstance]); // Removed `nodes` from dependencies to avoid potential loop with position preservation

  // Edges: allocations (resource → process), requests (process → resource)
  const [edges, setEdges] = useState<Edge[]>([]);
  useEffect(() => {
    setEdges([
      ...allocations.map((a, i) => ({
        id: `alloc-${i}`,
        source: a.processId,
        target: a.resourceId,
        label: `${a.amount}`,
        animated: false,
        style: { stroke: '#a1a1aa', strokeWidth: 2 }, // zinc-400
        labelBgStyle: { fill: '#27272a' }, // zinc-800
        labelStyle: { fill: '#e4e4e7' }, // zinc-200
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 4,
        type: 'allocation',
        markerEnd: { type: MarkerType.ArrowClosed, color: '#a1a1aa' }, // zinc-400
      })),
      ...requests.map((r, i) => ({
        id: `req-${i}`,
        source: r.processId,
        target: r.resourceId,
        label: `${r.amount}`,
        animated: true,
        style: { stroke: '#fb7185', strokeWidth: 2 }, // rose-400
        labelBgStyle: { fill: '#27272a' }, // zinc-800
        labelStyle: { fill: '#e4e4e7' }, // zinc-200
        markerEnd: { type: MarkerType.ArrowClosed, color: '#fb7185' }, // rose-400
        type: 'request',
      })),
    ]);

    // Fit view after edges update
    setTimeout(() => {
      flowInstance?.fitView();
    }, 0);
  }, [allocations, requests, flowInstance]);

  // when nodes change, update the nodes eg click on a node and move it
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );

  // when a connection is made, add the connection to the edges
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge({
      ...connection,
      animated: true,
      style: { stroke: '#60a5fa', strokeWidth: 3 }, // blue-400
      type: 'smoothstep'
    }, eds)),
    [setEdges],
  );

  return (
    <div style={{ width: '100%', height: '500px', border: '1px solid #3f3f46', borderRadius: '8px', backgroundColor: '#18181b' }}> {/* zinc-700 border, zinc-900 bg */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        colorMode='dark'
        onInit={setFlowInstance}
        fitView
        minZoom={0.5}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Background color="#3f3f46" variant={BackgroundVariant.Dots} gap={20} size={1} /> {/* zinc-700 dots */}
        <Controls
          showInteractive={true}
          className="bg-zinc-800 text-zinc-200 shadow-lg rounded-lg" // Dark mode controls
        />
      </ReactFlow>
    </div>
  );
};

export default ResourceAllocationGraph;