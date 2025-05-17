"use client";

import React, { useState } from 'react';
import type { Process, Resource } from '../types/simulatorTypes';

interface AllocateResourceFormProps {
  processes: Process[];
  resources: Resource[];
  onAllocate: (processId: string, resourceId: string, amount: number) => void;
}

const AllocateResourceForm: React.FC<AllocateResourceFormProps> = ({ processes, resources, onAllocate }) => {
  const [processId, setProcessId] = useState('');
  const [resourceId, setResourceId] = useState('');
  const [amount, setAmount] = useState('');

  const handleAllocate = () => {
    const amt = parseInt(amount, 10);
    if (processId && resourceId && !isNaN(amt) && amt > 0) {
      onAllocate(processId, resourceId, amt);
      setAmount('');
    }
  };

  return (
    <div className="flex gap-2 mb-2">
      <select
        className="border rounded px-2 py-1"
        value={processId}
        onChange={e => setProcessId(e.target.value)}
      >
        <option value="">Process</option>
        {processes.map(p => (
          <option key={p.id} value={p.id}>{p.id}</option>
        ))}
      </select>
      <select
        className="border rounded px-2 py-1"
        value={resourceId}
        onChange={e => setResourceId(e.target.value)}
      >
        <option value="">Resource</option>
        {resources.map(r => (
          <option key={r.id} value={r.id}>{r.id}</option>
        ))}
      </select>
      <input
        className="border rounded px-2 py-1 w-20"
        type="number"
        min={1}
        placeholder="Amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-3 py-1 rounded disabled:opacity-50"
        onClick={handleAllocate}
        disabled={!processId || !resourceId || !amount || isNaN(Number(amount)) || Number(amount) <= 0}
      >
        Allocate
      </button>
    </div>
  );
};

export default AllocateResourceForm;