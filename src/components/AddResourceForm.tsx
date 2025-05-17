"use client";

import React, { useState } from 'react';
import type { Resource } from '../types/simulatorTypes';

type AddResourceFormProps = {
  resources: Resource[];
  onAdd: (id: string, total: number) => void;
};

const AddResourceForm: React.FC<AddResourceFormProps> = ({ resources, onAdd }) => {
  const [nextResourceNumber, setNextResourceNumber] = useState(0);
  const [count, setCount] = useState(0);

  const handleAdd = () => {
    if (!isNaN(count) && count > 0) {
      onAdd(`R${nextResourceNumber}`, count);
      setNextResourceNumber(nextResourceNumber + 1);
      setCount(0);
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <label htmlFor="count">Count of Resources</label>
        <input
          className="border rounded px-2 py-1 w-20"
          type="number"
          min={1}
          placeholder="Count"
          value={count}
          onChange={e => setCount(parseInt(e.target.value, 10))}
        />
        <button
          className="cursor-pointer bg-blue-500 text-white px-3 py-1 rounded disabled:opacity-50"
          onClick={handleAdd}
          disabled={!count || isNaN(count) || count <= 0}
        >
          + Add Resource
        </button>
      </div>
      <ul className="text-sm text-gray-700 space-y-1">
        {resources.map(r => (
          <li key={r.id} className="border-b last:border-b-0 py-1 flex justify-between">
            <span>{r.id}</span>
            <span className="text-gray-500">{r.total}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddResourceForm;