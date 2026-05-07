// src/utils/localStorage.ts
export const storage = {
  // Lưu token
  setToken: (token: string) => localStorage.setItem('accessToken', token),
  getToken: () => localStorage.getItem('accessToken'),

  // Lưu refresh token (nếu cần cho logic refresh token sau này)
  setRefreshToken: (token: string) => localStorage.setItem('refreshToken', token),
  getRefreshToken: () => localStorage.getItem('refreshToken'),

  // Lưu thông tin user (chỉ những gì cần cho UI public, tránh lưu sensitive data nếu không cần)
  setUser: (user: any) => localStorage.setItem('user', JSON.stringify(user)),
  getUser: () => {
    const userStr = localStorage.getItem('user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  // Xóa tất cả khi logout
  clearAuth: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
};
