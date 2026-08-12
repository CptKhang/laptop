import axios from 'axios';

// 1. KHỞI TẠO INSTANCE (Gốc của API)
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. REQUEST INTERCEPTOR (Chiều đi: Nhét Token vào mọi request)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. RESPONSE INTERCEPTOR (Chiều về: Hứng lỗi và sơ cứu)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Kịch bản: Token hết hạn (Lỗi 401) VÀ chưa từng thử cứu (retry) request này
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu là đang cố cứu, tránh lặp vô tận

      try {
        // Lấy chìa khóa phụ (Refresh Token) từ kho chứa
        const refreshToken = localStorage.getItem('refresh_token'); 
        
        if (!refreshToken) {
           throw new Error("Không tìm thấy Refresh Token trong hệ thống");
        }

        // GỌI API XIN CẤP LẠI TOKEN TỚI BACKEND
        // 🔴 ĐIỂM NGHẼN RỦI RO: Đường dẫn '/auth/refresh' phải KHỚP CHÍNH XÁC với Backend
        const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
          refresh_token: refreshToken, // Key này cũng phải khớp với DTO của Backend NestJS
        });

        // Backend cấp thẻ mới -> Lưu đè lên thẻ cũ
        const newAccessToken = res.data.access_token;
        localStorage.setItem('access_token', newAccessToken);
        
        // (Tùy chọn) Nếu Backend cấp luôn refresh_token mới thì lưu lại
        if (res.data.refresh_token) {
          localStorage.setItem('refresh_token', res.data.refresh_token);
        }

        // Cập nhật thẻ mới vào Request vừa bị lỗi 401 lúc nãy VÀ GỬI LẠI TRONG IM LẶNG
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        // KỊCH BẢN TỒI TỆ NHẤT: Refresh Token cũng hết hạn hoặc bị lỗi -> ĐÁ VĂNG
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_role');
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'; 
        }
        return Promise.reject(refreshError);
      }
    }

    // Nếu là các lỗi khác (500 Server Error, 403 Forbidden...) thì ném ra cho Component tự bắt
    return Promise.reject(error);
  }
);