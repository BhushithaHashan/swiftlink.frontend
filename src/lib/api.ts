import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Token storage
let accessToken: string | null = null;

export const getAccessToken = () => accessToken;
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getRefreshToken = () => localStorage.getItem('refreshToken');
export const setRefreshToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('refreshToken', token);
  } else {
    localStorage.removeItem('refreshToken');
  }
};

export const clearTokens = () => {
  accessToken = null;
  localStorage.removeItem('refreshToken');
};

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach access token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ code?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Check if token expired
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);

        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        clearTokens();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (email: string, password: string) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  logout: async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken });
    }
    clearTokens();
  },
  refresh: async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
    return response.data;
  },
};

// Links API
export interface Link {
  code: string;
  url: string;
  userId?: string;
  revoked: boolean;
  expiresAt?: string;
  createdAt: string;
  clicks?: Click[];
}

export interface Click {
  ip: string;
  userAgent: string;
  createdAt: string;
}

export const linksApi = {
  create: async (url: string): Promise<{ message: string; data: Link }> => {
    const response = await api.post('/links', { url });
    return response.data;
  },
  resolve: async (code: string): Promise<{ data: Link }> => {
    const response = await api.get(`/links/${code}`);
    return response.data;
  },
  getUserLinks: async (): Promise<{ data: Link[] }> => {
    const response = await api.get('/links/me/links');
    return response.data;
  },
  delete: async (code: string): Promise<{ message: string }> => {
    const response = await api.delete(`/links/${code}`);
    return response.data;
  },
};
