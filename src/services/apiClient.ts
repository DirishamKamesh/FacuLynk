const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    let message = 'API request failed';
    if (typeof data === 'object' && data !== null && 'message' in data) {
      message = data.message;
    } else if (typeof data === 'string' && data.length > 0) {
      message = data;
    } else if (response.statusText) {
      message = response.statusText;
    }
    
    // In Phase 2/12, the AuthContext should intercept 401 globally if possible, 
    // or services can catch it. We throw it here so callers can handle it.
    throw new ApiError(response.status, message, data);
  }

  return data as T;
}

export const apiClient = {
  get: async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });
    return handleResponse<T>(response);
  },

  post: async <T>(url: string, body?: any, options: RequestInit = {}): Promise<T> => {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  put: async <T>(url: string, body?: any, options: RequestInit = {}): Promise<T> => {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  delete: async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });
    return handleResponse<T>(response);
  },
};
