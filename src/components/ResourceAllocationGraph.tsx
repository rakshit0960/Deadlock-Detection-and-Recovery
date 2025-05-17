"use client";

import { addEdge, applyEdgeChanges, applyNodeChanges, Background, BackgroundVariant, Controls, OnConnect, OnEdgesChange, OnNodesChange, ReactFlow, type Edge, type Node, ReactFlowInstance } from '@xyflow/react';
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
      ...processes.map((p, i) => ({
        id: p.id,
        data: { label: p.id },
        position: { x: i * (nodeWidth + 80), y: 0 }, // Increased spacing
        style: {
          width: nodeWidth,
          height: nodeHeight,
          borderRadius: '50%',
          border: '3px solid #3b82f6', // Blue border
          background: 'linear-gradient(145deg, #ffffff, #f3f4f6)',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#1e40af'
        },
        type: 'default',
      })),
      ...resources.map((r, i) => ({
        id: r.id,
        data: {
          label: <div className="text-center">
            <div className="font-bold text-emerald-700">{r.id}</div>
            <div className="text-sm text-emerald-600">{r.total}</div>
          </div>
        },
        position: { x: i * (nodeWidth + 80), y: 180 }, // Increased vertical spacing
        style: {
          width: nodeWidth,
          height: nodeHeight,
          borderRadius: '12px',
          border: '3px solid #059669', // Green border
          background: 'linear-gradient(145deg, #ffffff, #f0fdf4)',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          padding: '4px'
        },
        type: 'default',
      })),
    ]);

    // Fit view after nodes update
    setTimeout(() => {
      flowInstance?.fitView();
    }, 0);
  }, [processes, resources, flowInstance]);

  // Edges: allocations (resource → process), requests (process → resource)
  const [edges, setEdges] = useState<Edge[]>([]);
  useEffect(() => {
    setEdges([
      ...allocations.map((a, i) => ({
        id: `alloc-${i}`,
        source: a.resourceId,
        target: a.processId,
        label: <div>{a.amount.toString()}</div>,
        animated: false,
        style: { stroke: '#222', strokeWidth: 2 },
        labelBgStyle: { fill: '#fff' },
      })),
      ...requests.map((r, i) => ({
        id: `req-${i}`,
        source: r.processId,
        target: r.resourceId,
        label: <div>{r.amount.toString()}</div>,
        animated: true,
        style: { stroke: '#e11d48', strokeWidth: 2 },
        labelBgStyle: { fill: '#fff' },
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
      style: { stroke: '#dc2626', strokeWidth: 3 },
      type: 'smoothstep'
    }, eds)),
    [setEdges],
  );

  return (
    <div style={{ width: '100%', height: '500px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setFlowInstance}
        fitView
        minZoom={0.5}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Background color="#e5e7eb" variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls
          showInteractive={true}
          className="bg-white shadow-lg rounded-lg"
        />
      </ReactFlow>
    </div>
  );
};

export default ResourceAllocationGraph;