"use client";

import React, { useState } from 'react';
import type { Process } from '../types/simulatorTypes';

type AddProcessFormProps = {
  processes: Process[];
  onAdd: (id: string) => void;
};

const AddProcessForm: React.FC<AddProcessFormProps> = ({ processes, onAdd }) => {
  const [nextProcessNumber, setNextProcessNumber] = useState(0);

  const handleAdd = () => {
    onAdd(`P${nextProcessNumber}`);
    setNextProcessNumber(nextProcessNumber + 1);
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <button
          className="cursor-pointer bg-blue-500 text-white px-3 py-1 rounded disabled:opacity-50"
          onClick={handleAdd}
        >
          + Add Process
        </button>
      </div>
      <ul className="text-sm text-gray-700 space-y-1">
        {processes.map(p => (
          <li key={p.id} className="border-b last:border-b-0 py-1">{p.id}</li>
        ))}
      </ul>
    </div>
  );
};

export default AddProcessForm;