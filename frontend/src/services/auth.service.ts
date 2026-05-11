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
  
  registerDonor: async (data: any) => {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error: any) {
      let message = 'Đăng ký thất bại';
      if (error.response?.data?.message) {
        message = Array.isArray(error.response.data.message) 
          ? error.response.data.message[0] 
          : error.response.data.message;
      }
      throw new Error(message);
    }
  },

  verifyOtp: async (email: string, otp: string) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      return response.data;
    } catch (error: any) {
      let message = 'Xác thực OTP thất bại';
      if (error.response?.data?.message) {
        message = Array.isArray(error.response.data.message) 
          ? error.response.data.message[0] 
          : error.response.data.message;
      }
      throw new Error(message);
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      let message = 'Gửi yêu cầu thất bại';
      if (error.response?.data?.message) {
        message = Array.isArray(error.response.data.message) 
          ? error.response.data.message[0] 
          : error.response.data.message;
      }
      throw new Error(message);
    }
  },

  verifyForgotPasswordOtp: async (email: string, otp: string) => {
    try {
      const response = await api.post('/auth/verify-forgot-password-otp', { email, otp });
      return response.data;
    } catch (error: any) {
      let message = 'Xác thực OTP thất bại';
      if (error.response?.data?.message) {
        message = Array.isArray(error.response.data.message) 
          ? error.response.data.message[0] 
          : error.response.data.message;
      }
      throw new Error(message);
    }
  },

  resetPassword: async (email: string, resetToken: string, newPassword: string) => {
    try {
      const response = await api.post('/auth/reset-password', { email, resetToken, newPassword });
      return response.data;
    } catch (error: any) {
      let message = 'Đặt lại mật khẩu thất bại';
      if (error.response?.data?.message) {
        message = Array.isArray(error.response.data.message) 
          ? error.response.data.message[0] 
          : error.response.data.message;
      }
      throw new Error(message);
    }
  }
};
