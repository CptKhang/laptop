import { api } from '../utils/api';

// Định nghĩa interface để TypeScript kiểm soát chặt chẽ dữ liệu đầu vào
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export const AuthService = {
  // 1. Luồng đăng nhập dành riêng cho Khách hàng
  loginCustomer: async (payload: LoginPayload) => {
    const response = await api.post('/auth/login', payload);
    return response.data;
  },

  // 2. Luồng đăng nhập dành riêng cho Admin (Phân lập hoàn toàn)
  loginAdmin: async (payload: LoginPayload) => {
    const response = await api.post('/admin/auth/login', payload);
    return response.data;
  },

  // 3. Luồng đăng ký Khách hàng
  registerCustomer: async (payload: RegisterPayload) => {
    const response = await api.post('/auth/register', payload);
    return response.data;
  }
};