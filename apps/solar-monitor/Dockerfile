FROM denoland/deno:2.3.3

# Create working directory
WORKDIR /app
EXPOSE 8000

# Copy source
COPY apps/solar-monitor ./apps/solar-monitor
COPY packages/typescript/prometheus_metric_transformer ./packages/typescript/prometheus_metric_transformer
COPY packages/typescript/tesla_solar_client ./packages/typescript/tesla_solar_client
COPY deno.json ./deno.json

# Compile the main app
RUN deno cache ./apps/solar-monitor/mod.ts

# Run the app
CMD ["deno", "run", "--allow-env", "--allow-write", "--env-file=./apps/solar-monitor/.env.panel_a", "--env-file=./apps/solar-monitor/.env.panel_b", "--allow-net", "--unsafely-ignore-certificate-errors", "./apps/solar-monitor/mod.ts"]