
export function getEnvironment() {
  const panelA = {
    url: Deno.env.get("PANEL_A_URL"),
    email: Deno.env.get("PANEL_A_EMAIL"),
    password: Deno.env.get("PANEL_A_PASSWORD"),
  };
  const panelB = {
    url: Deno.env.get("PANEL_B_URL"),
    email: Deno.env.get("PANEL_B_EMAIL"),
    password: Deno.env.get("PANEL_B_PASSWORD"),
  };

  if (!panelA.url || !panelA.email || !panelA.password) {
    throw new Error("Missing required environment variable for panel_a");
  }
  if (!panelB.url || !panelB.email || !panelB.password) {
    throw new Error("Missing required environment variable for panel_b");
  }

  return {
    panelA: panelA as NonNullableKeys<typeof panelA>,
    panelB: panelB as NonNullableKeys<typeof panelB>,
  };
}

type NonNullableKeys<T> = {
  [K in keyof T]-?: NonNullable<T[K]>;
};
