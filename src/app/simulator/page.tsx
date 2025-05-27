"use client";

import AddProcessForm from '@/components/AddProcessForm';
import AddResourceForm from '@/components/AddResourceForm';
import AllocateResourceForm from '@/components/AllocateResourceForm';
import MatrixInput from '@/components/MatrixInput';
import RequestResourceForm from '@/components/RequestResourceForm';
import ResourceAllocationGraph from '@/components/ResourceAllocationGraph';
import SimulationLogs from '@/components/SimulationLogs';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSimulatorStore } from '@/store/useSimulatorStore';
import { useRAGStore } from '@/store/useRAGStore';
import { Settings2 } from "lucide-react";

const SimulatorPage = () => {
  const processes = useSimulatorStore((s) => s.processes);
  const resources = useSimulatorStore((s) => s.resources);
  const allocate = useSimulatorStore((s) => s.allocate);
  const request = useSimulatorStore((s) => s.request);
  const clearAll = useSimulatorStore((s) => s.clearAll);
  const addProcess = useSimulatorStore((s) => s.addProcess);
  const addResource = useSimulatorStore((s) => s.addResource);
  const updateGraphFromSimulator = useRAGStore((s) => s.updateGraphFromSimulator);

  const handleMatrixSubmit = (data: {
    allocation: number[][],
    request: number[][],
    available: number[]
  }) => {
    // Clear existing state
    clearAll();

    const numProcesses = data.allocation.length;
    const numResources = data.allocation[0].length;

    // Add processes
    for (let i = 0; i < numProcesses; i++) {
      addProcess(`P${i}`);
    }

    // Add resources with their total units (allocated + available)
    for (let j = 0; j < numResources; j++) {
      const totalAllocated = data.allocation.reduce((sum, row) => sum + row[j], 0);
      const totalUnits = totalAllocated + data.available[j];
      addResource(`R${j}`, totalUnits);
    }

    // Apply allocations
    data.allocation.forEach((row, processIndex) => {
      row.forEach((units, resourceIndex) => {
        if (units > 0) {
          allocate({
            processId: `P${processIndex}`,
            resourceId: `R${resourceIndex}`,
            amount: units
          });
        }
      });
    });

    // Apply requests
    data.request.forEach((row, processIndex) => {
      row.forEach((units, resourceIndex) => {
        if (units > 0) {
          request({
            processId: `P${processIndex}`,
            resourceId: `R${resourceIndex}`,
            amount: units
          });
        }
      });
    });

    // Update the graph visualization
    updateGraphFromSimulator();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto py-4">
          <h1 className="text-2xl font-bold text-center">
            Deadlock Detection and Recovery Simulation
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="manual" className="w-full">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="manual">Manual Input</TabsTrigger>
                    <TabsTrigger value="matrix">Matrix Input</TabsTrigger>
                  </TabsList>

                  <TabsContent value="manual" className="mt-4 space-y-4">
                    <div className="rounded-lg border p-4">
                      <h3 className="text-sm font-medium mb-3">Processes</h3>
                      <AddProcessForm />
                    </div>

                    <div className="rounded-lg border p-4">
                      <h3 className="text-sm font-medium mb-3">Resources</h3>
                      <AddResourceForm />
                    </div>

                    <div className="rounded-lg border p-4">
                      <h3 className="text-sm font-medium mb-3">Allocate Resource</h3>
                      <AllocateResourceForm
                        processes={processes}
                        resources={resources}
                        onAllocate={(processId, resourceId, amount) => {
                          allocate({ processId, resourceId, amount });
                          updateGraphFromSimulator();
                        }}
                      />
                    </div>

                    <div className="rounded-lg border p-4">
                      <h3 className="text-sm font-medium mb-3">Request Resource</h3>
                      <RequestResourceForm
                        processes={processes}
                        resources={resources}
                        onRequest={(processId, resourceId, amount) => {
                          request({ processId, resourceId, amount });
                          updateGraphFromSimulator();
                        }}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="matrix" className="mt-4">
                    <div className="rounded-lg border p-4">
                      <h3 className="text-sm font-medium mb-3">Matrix Input</h3>
                      <MatrixInput onSubmit={handleMatrixSubmit} />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Visualization */}
          <div className="space-y-6">
            {/* Graph */}
            <Card>
              <CardHeader>
                <CardTitle>Resource Allocation Graph</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square w-full border rounded-lg bg-background/50">
                  <ResourceAllocationGraph />
                </div>
              </CardContent>
            </Card>

            {/* Logs */}
            <Card>
              <CardHeader>
                <CardTitle>Simulation Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] overflow-y-auto rounded-lg border bg-muted/50 p-4">
                  <SimulationLogs />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulatorPage;