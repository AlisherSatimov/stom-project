// src/utils/axiosInstance.js

import axios from "axios";

// 1. To‘g‘ri nom bilan instance yaratish
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// 2. Requestga avtomatik token qo‘shish
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("aToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Agar 401 bo‘lsa, login sahifaga redirect qilish
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url;

    if (status === 401) {
      localStorage.removeItem("aToken");

      // 🔎 Login API dan yuborilgan bo'lmasa
      if (requestUrl !== "/auth/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
