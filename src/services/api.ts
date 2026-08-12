// Simulated async network latency for realistic SaaS behavior
export const delay = (ms: number = 150): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const API_BASE_URL = '/api/v1';
