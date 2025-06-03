import groupBy from 'lodash.groupby';

export type Metric = {
  name: string;
  labels: { [key: string]: string };
  value: number | string;
  type: string;
  help: string;
  ts: number;
};

export function getPrometheusMetrics(metrics: Metric[]): string {
  const out = []
  const metricsByName: { [key: string]: Metric[] } = groupBy(metrics, 'name');
  for (const [name, metrics] of Object.entries(metricsByName)) {
    out.push(`# HELP ${name} ${metrics[0].help}`);
    out.push(`# TYPE ${name} ${metrics[0].type}`);
    for (const metric of metrics) {
      const labels = Object.entries(metric.labels)
        .map(([key, value]) => `${key}="${value}"`)
        .join(',');
      out.push(`${name}{${labels}} ${metric.value} ${metric.ts}`);
    }
  }
  return out.join('\n');
}