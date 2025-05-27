"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface MatrixInputProps {
  onSubmit: (data: {
    allocation: number[][],
    request: number[][],
    available: number[]
  }) => void;
}

const MatrixInput: React.FC<MatrixInputProps> = ({ onSubmit }) => {
  const [numProcesses, setNumProcesses] = useState(5);
  const [numResources, setNumResources] = useState(5);
  const [allocation, setAllocation] = useState<string[][]>(
    Array(5).fill(null).map(() => Array(5).fill('0'))
  );
  const [request, setRequest] = useState<string[][]>(
    Array(5).fill(null).map(() => Array(5).fill('0'))
  );
  const [available, setAvailable] = useState<string[]>(Array(5).fill('0'));

  const handleDimensionChange = (processes: number, resources: number) => {
    setNumProcesses(processes);
    setNumResources(resources);

    // Resize matrices while preserving existing values
    setAllocation(prev => {
      const newMatrix = Array(processes).fill(null).map((_, i) =>
        Array(resources).fill(null).map((_, j) =>
          i < prev.length && j < prev[0].length ? prev[i][j] : '0'
        )
      );
      return newMatrix;
    });

    setRequest(prev => {
      const newMatrix = Array(processes).fill(null).map((_, i) =>
        Array(resources).fill(null).map((_, j) =>
          i < prev.length && j < prev[0].length ? prev[i][j] : '0'
        )
      );
      return newMatrix;
    });

    setAvailable(prev => {
      const newArray = Array(resources).fill(null).map((_, i) =>
        i < prev.length ? prev[i] : '0'
      );
      return newArray;
    });
  };

  const handleMatrixChange = (
    matrix: string[][],
    setMatrix: React.Dispatch<React.SetStateAction<string[][]>>,
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {
    const newValue = value.replace(/[^0-9]/g, '');
    const newMatrix = matrix.map((row, i) =>
      row.map((cell, j) => (i === rowIndex && j === colIndex ? newValue : cell))
    );
    setMatrix(newMatrix);
  };

  const handleSubmit = () => {
    const parsedAllocation = allocation.map(row => row.map(Number));
    const parsedRequest = request.map(row => row.map(Number));
    const parsedAvailable = available.map(Number);

    onSubmit({
      allocation: parsedAllocation,
      request: parsedRequest,
      available: parsedAvailable,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <Label>Number of Processes</Label>
          <Input
            type="number"
            min="1"
            max="20"
            value={numProcesses}
            onChange={(e) => handleDimensionChange(parseInt(e.target.value) || 1, numResources)}
          />
        </div>
        <div className="flex-1">
          <Label>Number of Resources</Label>
          <Input
            type="number"
            min="1"
            max="20"
            value={numResources}
            onChange={(e) => handleDimensionChange(numProcesses, parseInt(e.target.value) || 1)}
          />
        </div>
      </div>

      <div className="space-y-6">
        <Card className="p-4">
          <Label className="block mb-4">Allocation Matrix</Label>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th></th>
                  {Array(numResources).fill(null).map((_, i) => (
                    <th key={i} className="px-2 py-1 text-center">R{i}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allocation.slice(0, numProcesses).map((row, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1 text-center">P{i}</td>
                    {row.slice(0, numResources).map((cell, j) => (
                      <td key={j} className="px-1 py-1">
                        <Input
                          type="text"
                          value={cell}
                          className="w-12 h-8 text-center p-1"
                          onChange={(e) => handleMatrixChange(allocation, setAllocation, i, j, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-4">
          <Label className="block mb-4">Request Matrix</Label>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th></th>
                  {Array(numResources).fill(null).map((_, i) => (
                    <th key={i} className="px-2 py-1 text-center">R{i}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {request.slice(0, numProcesses).map((row, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1 text-center">P{i}</td>
                    {row.slice(0, numResources).map((cell, j) => (
                      <td key={j} className="px-1 py-1">
                        <Input
                          type="text"
                          value={cell}
                          className="w-12 h-8 text-center p-1"
                          onChange={(e) => handleMatrixChange(request, setRequest, i, j, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-4">
          <Label className="block mb-4">Available Resources</Label>
          <div className="flex gap-2 overflow-x-auto">
            {available.slice(0, numResources).map((value, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-sm mb-1">R{i}</span>
                <Input
                  type="text"
                  value={value}
                  className="w-12 h-8 text-center p-1"
                  onChange={(e) => {
                    const newValue = e.target.value.replace(/[^0-9]/g, '');
                    setAvailable(prev => prev.map((v, idx) => idx === i ? newValue : v));
                  }}
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Button onClick={handleSubmit} className="w-full">
        Apply Matrix Input
      </Button>
    </div>
  );
};

export default MatrixInput;