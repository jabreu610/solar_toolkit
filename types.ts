export type Metric = {
  name: string;
  labels: { [key: string]: string };
  value: number | string;
  type: string;
  help: string;
  ts: number;
};