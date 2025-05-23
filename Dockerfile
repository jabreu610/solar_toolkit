FROM denoland/deno:2.3.3

# Create working directory
WORKDIR /app
EXPOSE 8000

# Copy source
COPY . .

# Compile the main app
RUN deno cache main.ts

# Run the app
CMD ["deno", "run", "--allow-env", "--allow-write", "--env-file=.env.panel_a", "--env-file=.env.panel_b", "--allow-net", "--unsafely-ignore-certificate-errors", "./mod.ts"]