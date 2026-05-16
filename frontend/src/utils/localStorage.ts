// src/utils/localStorage.ts
export const storage = {
  // Lưu token
  setToken: (token: string) => localStorage.setItem('accessToken', token),
  getToken: () => localStorage.getItem('accessToken'),

  // Lưu refresh token (nếu cần cho logic refresh token sau này)
  setRefreshToken: (token: string) => localStorage.setItem('refreshToken', token),
  getRefreshToken: () => localStorage.getItem('refreshToken'),

  // Xóa tất cả khi logout
  clearAuth: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
};
