import { Hono } from "hono";
import { timing, startTime, endTime } from "hono/timing";
import type { TimingVariables } from "hono/timing";

import { getPanelsPrometheusMetrics } from "./metrics_fetcher.ts";
import { getPrometheusMetrics } from "../../packages/typescript/prometheus_metric_transformer/prometheus_metric_transformer.ts";
import { VERSION } from "./version.ts";

type Variables = TimingVariables;
const app = new Hono<{ Variables: Variables }>();

app.use("/metrics", async (c, next) => {
  const ts = Date.now();
  await next();
  const timing = c.res.headers.get("Server-Timing");
  const match = timing?.match(/metrics;dur=(?<duration>\d*.?\d*),/);
  const metricsDuration = match?.groups?.duration;
  if (metricsDuration) {
    const originalResponse = c.res;
    const originalBody = await originalResponse.text();
    const amendment = getPrometheusMetrics([{
      name: "solar_server_metrics_response_time_ms",
      help: "Metrics response time",
      type: "gauge",
      labels: { version: VERSION },
      value: metricsDuration,
      ts,
    }]);

    const modifiedBody = `${originalBody}\n${amendment}`;

    c.res = new Response(modifiedBody, {
      status: originalResponse.status,
      headers: originalResponse.headers,
    });
  }
});

app.use(timing());

app.get("/metrics", async (c) => {
  startTime(c, "metrics");
  const metrics = await getPanelsPrometheusMetrics();
  endTime(c, "metrics");
  return c.text(metrics);
});

Deno.serve(app.fetch);
