"use client";

import React, { useState } from 'react';
import type { Process, Resource } from '../types/simulatorTypes';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useRAGStore } from "../store/useRAGStore";

interface AllocateResourceFormProps {
  processes: Process[];
  resources: Resource[];
  onAllocate: (processId: string, resourceId: string, amount: number) => void;
}

const AllocateResourceForm: React.FC<AllocateResourceFormProps> = ({ processes, resources, onAllocate }) => {
  const [processId, setProcessId] = useState('');
  const [resourceId, setResourceId] = useState('');
  const [amount, setAmount] = useState('');
  const updateGraphFromSimulator = useRAGStore((s) => s.updateGraphFromSimulator);

  const handleAllocate = () => {
    const amt = parseInt(amount, 10);
    if (processId && resourceId && !isNaN(amt) && amt > 0) {
      onAllocate(processId, resourceId, amt);
      setAmount('');
      updateGraphFromSimulator();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Select value={processId} onValueChange={setProcessId}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Process" />
          </SelectTrigger>
          <SelectContent>
            {processes.map((p) => {
              const processNum = parseInt(p.id.substring(1));
              return (
                <SelectItem key={p.id} value={p.id}>
                  P{processNum}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <Select value={resourceId} onValueChange={setResourceId}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Resource" />
          </SelectTrigger>
          <SelectContent>
            {resources.map((r) => {
              const resourceNum = parseInt(r.id.substring(1));
              return (
                <SelectItem key={r.id} value={r.id}>
                  R{resourceNum}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <Input
          type="number"
          min={1}
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-32"
        />

        <Button
          onClick={handleAllocate}
          disabled={!processId || !resourceId || !amount || isNaN(Number(amount)) || Number(amount) <= 0}
          className="flex-1"
        >
          Allocate
        </Button>
      </div>
    </div>
  );
};

export default AllocateResourceForm;