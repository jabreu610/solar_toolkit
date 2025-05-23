const USERNAME = "customer";

type AuthResponse = {
  email: string;
  firstname: string;
  lastname: string;
  roles: string[];
  token: string;
  provider: string;
  loginTime: string;
};

type BatteryResponse = {
  percentage: number;
};

type MeterData = {
  last_communication_time: string;
  instant_power: number;
  instant_reactive_power: number;
  instant_apparent_power: number;
  frequency: number;
  energy_exported: number;
  energy_imported: number;
  instant_average_voltage: number;
  instant_average_current: number;
  i_a_current: number;
  i_b_current: number;
  i_c_current: number;
  last_phase_voltage_communication_time: string;
  last_phase_power_communication_time: string;
  last_phase_energy_communication_time: string;
  timeout: number;
  num_meters_aggregated?: number;
  instant_total_current?: number;
};

type MeterResponse = {
  site: MeterData;
  battery: MeterData;
  load: MeterData;
  solar: MeterData;
};

type PanelStatus = MeterResponse & {
  battery: BatteryResponse & MeterData;
};

export class TeslaSolarClient {
  private baseUrl: string;
  private token?: string;
  private email: string;
  private password: string;

  constructor(baseUrl: string, email: string, password: string) {
    this.baseUrl = baseUrl;
    this.email = email;
    this.password = password;
  }

  private async authenticate(): Promise<void> {
    const url = `${this.baseUrl}/api/login/Basic`;
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        username: USERNAME,
        password: this.password,
        email: this.email,
      }),
    });
    if (!response.ok) {
      throw new Error("Authentication failed");
    }
    const data: AuthResponse = await response.json();
    this.token = data.token;
  }

  private async fetchBatteryStatus(): Promise<BatteryResponse> {
    if (!this.token) {
      await this.initialize();
    }
    const url = `${this.baseUrl}/api/system_status/soe`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch battery status");
    }
    return await response.json();
  }

  private async fetchMeterData(): Promise<MeterResponse> {
    if (!this.token) {
      await this.initialize();
    }
    const url = `${this.baseUrl}/api/meters/aggregates`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch meter data");
    }
    return await response.json();
  }

  async initialize(): Promise<void> {
    await this.authenticate();
  }

  async getPanelStatus(): Promise<PanelStatus> {
    if (!this.token) {
      await this.initialize();
    }
    const [batteryStatus, meterData] = await Promise.all([
      this.fetchBatteryStatus(),
      this.fetchMeterData(),
    ]);

    return {
      ...meterData,
      battery: {
        ...batteryStatus,
        ...meterData.battery,
      },
    };
  }
}
