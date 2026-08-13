import axios, { type AxiosRequestConfig } from "axios";

const logError = (error: any, context?: string) => {
  console.error(`[${context || "Error"}]:`, error);
};

export class ApiError extends Error {
  status: number;
  payload: any;
  isNetworkError: boolean;

  constructor(
    message: string,
    status: number,
    payload: any = null,
    isNetworkError: boolean = false,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
    this.isNetworkError = isNetworkError;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Normalizes any API or Axios error into a consistent ApiError instance.
 */
export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 0;
    const data = error.response?.data;

    let message = "An unexpected error occurred. Please try again.";

    if (data && typeof data === "object") {
      message = data.error || data.message || data.detail || message;
    } else if (typeof data === "string" && data.trim().length > 0) {
      message = data;
    } else if (error.message) {
      message = error.message;
    }

    if (
      status === 0 ||
      error.code === "ERR_NETWORK" ||
      error.code === "ECONNABORTED"
    ) {
      message = "Network connection issue. Please check backend server status.";
      return new ApiError(message, 0, data, true);
    }

    return new ApiError(message, status, data, false);
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 500, null, false);
  }

  return new ApiError("An unknown error occurred", 500, error, false);
}

const getBaseUrl = () => {
  const envUrl = import.meta.env.CLIENT_URL?.replace(/\/$/, "");
  return envUrl ?? "http://localhost:3000";
};

const BASE_URL = getBaseUrl();

/**
 * Custom Axios Instance
 */
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

// Request Interceptor: Attach Auth Token
//api.interceptors.request.use(
//  (config) => {
//    const token = typeof window !== "undefined" ? getAuthCookie() : null;
//    if (token) {
//      config.headers.Authorization = `Bearer ${token}`;
//    }
//    return config;
//  },
//  (error) => {
//    logError(error, "Axios Request Interceptor");
//    return Promise.reject(normalizeApiError(error));
//  },
//);

// Response Interceptor: Catch and log non-2XX responses without crashing
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    const status = error.response?.status;

    if (status === 401) {
      console.warn("Unauthorized API call. Token may be missing or expired.");
    }

    const errorContext = status
      ? `API Response Error: ${status}`
      : `API Network Error: ${error.message || "Unknown"}`;

    logError(error, errorContext);

    return Promise.reject(normalizeApiError(error));
  },
);

/**
 * Production-Grade ApiService Wrapper
 */
export const ApiService = {
  get: async <T>(
    url: string,
    params?: object,
    headers?: AxiosRequestConfig["headers"],
  ): Promise<T> => {
    try {
      const response = await api.get<T>(url, { params, headers });
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  post: async <T>(
    url: string,
    data?: object,
    headers?: AxiosRequestConfig["headers"],
  ): Promise<T> => {
    try {
      const response = await api.post<T>(url, data, { headers });
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  put: async <T>(
    url: string,
    data?: object,
    headers?: AxiosRequestConfig["headers"],
  ): Promise<T> => {
    try {
      const response = await api.put<T>(url, data, { headers });
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  delete: async <T>(
    url: string,
    headers?: AxiosRequestConfig["headers"],
  ): Promise<T> => {
    try {
      const response = await api.delete<T>(url, { headers });
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  patch: async <T>(
    url: string,
    data?: object,
    headers?: AxiosRequestConfig["headers"],
  ): Promise<T> => {
    try {
      const response = await api.patch<T>(url, data, { headers });
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};

export const axiosInstance = api;
