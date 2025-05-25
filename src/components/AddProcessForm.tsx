"use client";

import React from 'react';
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Trash2Icon } from "lucide-react";
import { useSimulatorStore } from "../store/useSimulatorStore";
import { useRAGStore } from "../store/useRAGStore";

const AddProcessForm: React.FC = () => {
  const processes = useSimulatorStore((s) => s.processes);
  const addProcess = useSimulatorStore((s) => s.addProcess);
  const removeProcess = useSimulatorStore((s) => s.removeProcess);
  const updateGraphFromSimulator = useRAGStore((s) => s.updateGraphFromSimulator);

  const handleAdd = () => {
    // Get the next process number by finding the highest existing number and adding 1
    const nextProcessNum = processes.length > 0
      ? Math.max(...processes.map(p => parseInt(p.id.substring(1)))) + 1
      : 0;
    addProcess(`P${nextProcessNum}`);
    updateGraphFromSimulator();
  };

  const handleRemove = () => {
    if (processes.length > 0) {
      // Only remove the last process
      removeProcess(processes[processes.length - 1].id);
      updateGraphFromSimulator();
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleAdd}
        className="w-full"
        variant="default"
      >
        Add Process
      </Button>

      <ScrollArea className="h-[200px] w-full rounded-md border">
        <div className="p-4 flex flex-col gap-2">
          {processes.map((p) => {
            const processNum = parseInt(p.id.substring(1));
            return (
              <Card key={p.id}>
                <div className="flex items-center justify-around">
                  <Badge variant="outline" className="text-md w-1/2">
                    Process {processNum}
                  </Badge>
                  {p.id === processes[processes.length - 1].id && (
                    <Button
                      className='w-1/12'
                      variant="ghost"
                      size="icon"
                      onClick={handleRemove}
                      aria-label={`Remove process ${processNum}`}
                    >
                      <Trash2Icon className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
          {processes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No processes added yet
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AddProcessForm;