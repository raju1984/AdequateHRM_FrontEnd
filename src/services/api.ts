
import axios from "axios";

const api = axios.create({
  baseURL: "http://jupiterapi.adequateshop.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ATTACH ACCESS TOKEN TO API REQUESTS
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
