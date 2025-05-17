"use client";

import React from 'react';
import AddProcessForm from '../../components/AddProcessForm';
import AddResourceForm from '../../components/AddResourceForm';
import AllocateResourceForm from '../../components/AllocateResourceForm';
import RequestResourceForm from '../../components/RequestResourceForm';
import DetectionControls from '../../components/DetectionControls';
import ResourceAllocationGraph from '../../components/ResourceAllocationGraph';
import { useSimulatorStore } from '../../store/useSimulatorStore';

const SimulatorPage = () => {
  const processes = useSimulatorStore((s) => s.processes);
  const addProcess = useSimulatorStore((s) => s.addProcess);
  const resources = useSimulatorStore((s) => s.resources);
  const addResource = useSimulatorStore((s) => s.addResource);
  const allocate = useSimulatorStore((s) => s.allocate);
  const request = useSimulatorStore((s) => s.request);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Deadlock Detection and Recovery Simulation</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Left Column: Forms and Controls */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold mb-4">Processes</h2>
            <AddProcessForm processes={processes} onAdd={addProcess} />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold mb-4">Resources</h2>
            <AddResourceForm resources={resources} onAdd={addResource} />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold mb-4">Allocate Resource</h2>
            <AllocateResourceForm processes={processes} resources={resources} onAllocate={(processId, resourceId, amount) => allocate({ processId, resourceId, amount })} />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold mb-4">Request Resource</h2>
            <RequestResourceForm processes={processes} resources={resources} onRequest={(processId, resourceId, amount) => request({ processId, resourceId, amount })} />
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
            <h2 className="font-semibold mb-2">Detection Method</h2>
            <DetectionControls />
            <button className="mt-2 bg-gray-200 text-gray-700 px-4 py-2 rounded disabled:opacity-50" disabled>Start Simulation</button>
          </div>
        </div>
        {/* Right Column: Graph and Logs */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <h2 className="font-semibold mb-4">Resource Allocation Graph</h2>
            <ResourceAllocationGraph />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold mb-4">Logs</h2>
            {/* Placeholder for logs */}
            <ul className="text-sm text-gray-700 space-y-1">
              <li>Step 3 &nbsp; Deadlock detected between P1 &lt;=&gt; P2</li>
              <li>Step 4 &nbsp; Q-Agent chose: terminate P2</li>
              <li>Step 5 &nbsp; Deadlock resolved.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulatorPage;