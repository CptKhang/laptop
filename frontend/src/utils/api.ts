// 1. IMPORT THƯ VIỆN
import axios from 'axios';

// 2. KHỞI TẠO INSTANCE (Gốc của API)
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
}); //[cite: 1]

// 3. REQUEST INTERCEPTOR (Xử lý dữ liệu TRƯỚC KHI GỬI ĐI)
// Chiều đi: Tự động nhét Token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}); //[cite: 1]

// 4. RESPONSE INTERCEPTOR (Xử lý dữ liệu SAU KHI NHẬN VỀ)
// ---> NÓ NẰM Ở ĐÂY <---
// Chiều về: Bắt lỗi 401 để xóa token và đá văng về trang login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token'); //[cite: 1]
      
      // Đoạn mã điều hướng tự thêm:
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'; 
      }
    }
    return Promise.reject(error); //[cite: 1]
  },
);