"use client";

import React, { useState, ChangeEvent } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Trash2Icon, Edit3Icon, CheckIcon, XIcon } from "lucide-react";
import { useSimulatorStore } from "../store/useSimulatorStore";

const AddResourceForm: React.FC = () => {
  const resources = useSimulatorStore((s) => s.resources);
  const addResource = useSimulatorStore((s) => s.addResource);
  const removeResource = useSimulatorStore((s) => s.removeResource);
  const updateResource = useSimulatorStore((s) => s.updateResource);

  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceCount, setNewResourceCount] = useState<number | string>("");

  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [editingResourceTotal, setEditingResourceTotal] = useState<number | string>("");

  const handleAddNewResource = () => {
    if (newResourceName.trim() && typeof newResourceCount === 'number' && newResourceCount > 0) {
      if (resources.some(r => r.id === newResourceName.trim())) {
        alert(`Resource ID ${newResourceName.trim()} already exists.`);
        return;
      }
      addResource(newResourceName.trim(), newResourceCount);
      setNewResourceName('');
      setNewResourceCount('');
    } else {
      alert("Please provide a valid resource name and a count greater than 0.");
    }
  };

  const handleEdit = (resource: { id: string; total: number }) => {
    setEditingResourceId(resource.id);
    setEditingResourceTotal(resource.total);
  };

  const handleSaveEdit = (resourceId: string) => {
    if (typeof editingResourceTotal === 'number' && editingResourceTotal >= 0) {
      const resource = resources.find(r => r.id === resourceId);
      if (resource) {
        const currentlyAllocated = resource.total - resource.available;
        if (editingResourceTotal < currentlyAllocated) {
          alert(`New total (${editingResourceTotal}) cannot be less than currently allocated units (${currentlyAllocated}).`);
          return;
        }
        updateResource(resourceId, editingResourceTotal);
      }
    }
    setEditingResourceId(null);
    setEditingResourceTotal('');
  };

  const handleCancelEdit = () => {
    setEditingResourceId(null);
    setEditingResourceTotal('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end border p-4 rounded-lg">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="newResourceName">Resource Name (e.g., R1)</Label>
          <Input
            id="newResourceName"
            placeholder="R1"
            value={newResourceName}
            onChange={(e) => setNewResourceName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="newResourceCount">Total Units</Label>
          <Input
            id="newResourceCount"
            type="number"
            min={1}
            placeholder="e.g., 10"
            value={newResourceCount}
            onChange={(e) => setNewResourceCount(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
          />
        </div>
        <Button
          onClick={handleAddNewResource}
          disabled={!newResourceName.trim() || !(typeof newResourceCount === 'number' && newResourceCount > 0)}
          className="w-full md:w-auto"
        >
          Add Resource
        </Button>
      </div>

      <ScrollArea className="h-[200px] w-full rounded-md border">
        <div className="p-4">
          {resources.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No resources added yet
            </p>
          )}
          {resources.map(r => (
            <Card
              key={r.id}
              className="flex items-center justify-between p-3 mb-2 last:mb-0 gap-2"
            >
              {editingResourceId === r.id ? (
                <>
                  <Badge variant="secondary" className="text-sm whitespace-nowrap">
                    {r.id}
                  </Badge>
                  <Input
                    type="number"
                    min={0}
                    value={editingResourceTotal}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEditingResourceTotal(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    className="h-8 w-20 text-sm"
                    autoFocus
                  />
                  <Button variant="ghost" size="icon" onClick={() => handleSaveEdit(r.id)} aria-label="Save">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleCancelEdit} aria-label="Cancel">
                    <XIcon className="h-4 w-4 text-red-500" />
                  </Button>
                </>
              ) : (
                <>
                  <Badge variant="outline" className="text-sm">
                    {r.id}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Total: {r.total} (Available: {r.available})
                  </span>
                  <div className="flex items-center ml-auto">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(r)} aria-label={`Edit resource ${r.id}`}>
                      <Edit3Icon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => removeResource(r.id)} aria-label={`Remove resource ${r.id}`}>
                      <Trash2Icon className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AddResourceForm;