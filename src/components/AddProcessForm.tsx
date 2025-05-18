"use client";

import React, { useState } from 'react';
// import type { Process } from '../types/simulatorTypes'; // Removed
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

  const [nextProcessNumber, setNextProcessNumber] = useState(() => {
    if (processes.length === 0) return 0;
    const maxNum = processes.reduce((max, p) => {
      const num = parseInt(p.id.replace('P', ''), 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, -1);
    return maxNum + 1;
  });

  const handleAdd = () => {
    const newProcessId = `P${nextProcessNumber}`;
    if (processes.some(p => p.id === newProcessId)) {
      let num = nextProcessNumber;
      while (processes.some(p => p.id === `P${num}`)) {
        num++;
      }
      addProcess(`P${num}`);
      setNextProcessNumber(num + 1);
      return;
    }
    addProcess(newProcessId);
    setNextProcessNumber(nextProcessNumber + 1);
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
          {processes.map(p => (
            <Card key={p.id}>
              <div className="flex items-center justify-around">
                <Badge variant="outline" className="text-md w-1/2">
                  {p.id}
                </Badge>
              <Button
                className='w-1/12'
                variant="ghost"
                size="icon"
                onClick={() => removeProcess(p.id)}
                aria-label={`Remove process ${p.id}`}
                >
                <Trash2Icon className="h-4 w-4 text-destructive" />
              </Button>
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