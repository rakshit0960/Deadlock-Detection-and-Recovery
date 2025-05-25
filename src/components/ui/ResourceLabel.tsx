import React from 'react';

interface ResourceLabelProps {
  index: number;
  total: number;
}

const ResourceLabel: React.FC<ResourceLabelProps> = ({ index, total }) => {
  return (
    <div className="text-center">
      <div className="font-bold text-emerald-300">R{index}</div>
      <div className="text-sm text-emerald-200">{total}</div>
    </div>
  );
};

export const renderResourceLabel = (index: number, total: number) => {
  return `R${index}\nTotal: ${total}`;
};

export default ResourceLabel;