import axios from 'axios';
import { storage } from '../utils/localStorage';

// Lấy base URL từ biến môi trường hoặc dùng localhost mặc định
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để tự động gắn token vào header cho các request có yêu cầu auth
api.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu gặp lỗi 401 và request chưa được thử lại, và không phải endpoint refresh-token
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh-token') {

      // Đang có 1 request refresh đang được gọi thì đưa các request error khác vào hàng chờ
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = storage.getRefreshToken();

      // Không có refresh token -> cần đăng nhập lại
      if (!refreshToken) {
        isRefreshing = false;
        storage.clearAuth();
        window.location.href = '/auth';
        return Promise.reject(error);
      }

      try {
        // Dùng một instance axios độc lập để không kích hoạt cấu hình interceptor này cho refresh api call
        const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });

        const newAccessToken = response.data?.data?.accessToken;

        if (newAccessToken) {
          storage.setToken(newAccessToken);

          processQueue(null, newAccessToken);

          return api(originalRequest); // Gửi lại request ban đầu với token mới được nhét bởi interceptor
        } else {
          throw new Error('Token data is missing');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        storage.clearAuth();
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
