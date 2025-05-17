export type Process = {
  id: string; // e.g. "P1"
};

export type Resource = {
  id: string; // e.g. "R1"
  available: number;
  total: number;
};

export type Allocation = {
  processId: string;
  resourceId: string;
  amount: number;
};

export type Request = {
  processId: string;
  resourceId: string;
  amount: number;
};