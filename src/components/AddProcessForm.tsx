"use client";

import React from 'react';
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Trash2Icon } from "lucide-react";
import { useSimulatorStore } from "../store/useSimulatorStore";

const AddProcessForm: React.FC = () => {
  const processes = useSimulatorStore((s) => s.processes);
  const addProcess = useSimulatorStore((s) => s.addProcess);
  const removeProcess = useSimulatorStore((s) => s.removeProcess);

  const handleAdd = () => {
    // Next process number will be current length
    const nextProcessNum = processes.length;
    addProcess(`P${nextProcessNum}`);
  };

  const handleRemove = () => {
    if (processes.length > 0) {
      // Only remove the last process
      removeProcess(processes[processes.length - 1].id);
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
          {processes.map((p, index) => (
            <Card key={p.id}>
              <div className="flex items-center justify-around">
                <Badge variant="outline" className="text-md w-1/2">
                  Process {index}
                </Badge>
                {index === processes.length - 1 && (
                  <Button
                    className='w-1/12'
                    variant="ghost"
                    size="icon"
                    onClick={handleRemove}
                    aria-label={`Remove process ${index}`}
                  >
                    <Trash2Icon className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
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