import { Hono } from 'hono'
import { getPanelsPrometheusMetrics } from "./metrics_fetcher.ts";

const app = new Hono()

app.get('/metrics', async (c) => c.text(await getPanelsPrometheusMetrics()))

Deno.serve(app.fetch)