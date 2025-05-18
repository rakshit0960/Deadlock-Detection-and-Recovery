import { LayoutOptions } from "elkjs/lib/elk.bundled";

export const nodeWidth = 50;
export const nodeHeight = 50;


export const elkLayoutOptionsBase: LayoutOptions = {
  'elk.algorithm': 'layered',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
  'elk.spacing.nodeNode': '80',
  'elk.direction': 'DOWN',
};
