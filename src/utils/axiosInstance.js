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
    console.log(error);
    if (error.response?.status === 401) {
      localStorage.removeItem("aToken");
      localStorage.setItem(
        "authErrorMessage",
        "Session expired. Please log in again."
      );
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// 4. Instance’ni eksport qilish
export default axiosInstance;
