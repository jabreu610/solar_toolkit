import { TeslaSolarClient } from "./tesla_solar_client.ts";
import { getEnvironment } from "./environment.ts";
import { Metric } from "./types.ts";
import { getPrometheusMetrics } from "./prometheus_metric_transformer.ts";

const KEYS_TO_METRIC = {
  instant_power: {
    name: "instant_power_watts",
    type: "gauge",
    help: "Instant power in watts",
  },
  energy_exported: {
    name: "energy_exported_watt_hours",
    type: "counter",
    help: "Energy exported in watt hours",
  },
  energy_imported: {
    name: "energy_imported_watt_hours",
    type: "counter",
    help: "Energy imported in watt hours",
  },
  percentage: {
    name: "battery_percentage",
    type: "gauge",
    help: "Battery percentage",
  },
};

export async function getPanelsPrometheusMetrics(): Promise<string> {
  const { panelA, panelB } = getEnvironment();
  const clientA = new TeslaSolarClient(
    panelA.url,
    panelA.email,
    panelA.password
  );
  const clientB = new TeslaSolarClient(
    panelB.url,
    panelB.email,
    panelB.password
  );
  const [panelStatusA, panelStatusB] = await Promise.all([
    clientA.getPanelStatus(),
    clientB.getPanelStatus(),
  ]);

  const status = {
    a: panelStatusA,
    b: panelStatusB,
  };

  const metrics: Metric[] = [];

  for (const [panelKey, panelStatus] of Object.entries(status)) {
    for (const [componentKey, componentStatus] of Object.entries(panelStatus)) {
      if (!componentStatus.last_communication_time) continue;
      const ts = new Date(componentStatus.last_communication_time).getTime();
      for (const [metricKey, value] of Object.entries(componentStatus)) {
        if (value === undefined || !(metricKey in KEYS_TO_METRIC)) continue;
        const { name, type, help } =
          KEYS_TO_METRIC[metricKey as keyof typeof KEYS_TO_METRIC];
        metrics.push({
          name: `solar_${name}`,
          labels: { panel: panelKey, component: componentKey },
          value,
          type,
          help,
          ts,
        });
      }
    }
  }

  return getPrometheusMetrics(metrics);
}
