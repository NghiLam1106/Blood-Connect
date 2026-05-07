import api from './api';

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data; // Trả về data (thường là { access_token, user: {...} })
    } catch (error: any) {
      // Bắt lỗi và lấy message từ backend để hiển thị ra UI
      const message = error.response?.data?.message || 'Đăng nhập thất bại';
      throw new Error(message);
    }
  },
  // Các hàm khác như register, forgotPassword có thể viết ở đây...
};
