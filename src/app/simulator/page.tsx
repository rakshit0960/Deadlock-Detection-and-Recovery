"use client";

import AddProcessForm from '../../components/AddProcessForm';
import AddResourceForm from '../../components/AddResourceForm';
import AllocateResourceForm from '../../components/AllocateResourceForm';
import RequestResourceForm from '../../components/RequestResourceForm';
import ResourceAllocationGraph from '../../components/ResourceAllocationGraph';
import SimulationLogs from '@/components/SimulationLogs';
import { useSimulatorStore } from '../../store/useSimulatorStore';

const SimulatorPage = () => {
  const processes = useSimulatorStore((s) => s.processes);
  const resources = useSimulatorStore((s) => s.resources);
  const allocate = useSimulatorStore((s) => s.allocate);
  const request = useSimulatorStore((s) => s.request);

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-foreground">Deadlock Detection and Recovery Simulation</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Left Column: Forms and Controls */}
        <div className="flex flex-col gap-6">
          <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
            <h2 className="font-semibold mb-4 text-card-foreground">Processes</h2>
            <AddProcessForm />
          </div>
          <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
            <h2 className="font-semibold mb-4 text-card-foreground">Resources</h2>
            <AddResourceForm />
          </div>
          <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
            <h2 className="font-semibold mb-4 text-card-foreground">Allocate Resource</h2>
            <AllocateResourceForm
              processes={processes}
              resources={resources}
              onAllocate={(processId, resourceId, amount) => allocate({ processId, resourceId, amount })}
            />
          </div>
          <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
            <h2 className="font-semibold mb-4 text-card-foreground">Request Resource</h2>
            <RequestResourceForm
              processes={processes}
              resources={resources}
              onRequest={(processId, resourceId, amount) => request({ processId, resourceId, amount })}
            />
          </div>
        </div>
        {/* Right Column: Graph and Logs */}
        <div className="space-y-6">
          <div className="bg-card rounded-lg shadow-lg p-6 border border-border flex flex-col items-center">
            <h2 className="font-semibold mb-4 text-card-foreground">Resource Allocation Graph</h2>
            <ResourceAllocationGraph />
          </div>
          <SimulationLogs />
        </div>x
      </div>
    </div>
  );
};

export default SimulatorPage;