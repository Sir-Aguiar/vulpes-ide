import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(new Error(String(error)));
  },
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");

      const publicPaths = ["/login", "/signup", "/validate-order"];
      const isPublicPath =
        typeof window !== "undefined" &&
        publicPaths.some((path) => window.location.pathname.startsWith(path));

      if (typeof window !== "undefined" && !isPublicPath) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(new Error(String(error)));
  },
);

export default API;
