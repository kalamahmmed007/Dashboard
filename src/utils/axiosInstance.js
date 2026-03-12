import axios from "axios";
import store from "../redux/store";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
});

// 🔐 attach token automatically
axiosInstance.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth?.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🚪 auto logout on 401
axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch({ type: "auth/logout" });
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;