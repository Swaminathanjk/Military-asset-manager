import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api",
});

// Add token from localStorage (or your preferred storage)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Store your backend token in localStorage after login/signup
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;


