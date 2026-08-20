import axios, { type InternalAxiosRequestConfig } from "axios";
import { encodeRequest, isEncryptedEnvelope } from "@/utils/crypto";

const ENCRYPTED_BODY_PATHS = new Set([
  "/auth/login",
  "/auth/signup",
  "/reset-password",
  "/reset-password/confirm",
  "/user/change-password",
]);

function canonicalizePath(url: string | undefined): string {
  if (!url) {
    return "";
  }

  const withoutQuery = url.split("?", 1)[0] ?? "";

  if (
    withoutQuery.startsWith("http://") ||
    withoutQuery.startsWith("https://")
  ) {
    return new URL(withoutQuery).pathname;
  }

  return withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
}

function shouldEncryptBody(config: InternalAxiosRequestConfig): boolean {
  const method = config.method?.toLowerCase();

  if (method !== "post" && method !== "patch" && method !== "put") {
    return false;
  }

  const { data, url } = config;

  if (typeof data !== "object" || data === null) {
    return false;
  }

  if (typeof FormData !== "undefined" && data instanceof FormData) {
    return false;
  }

  if (isEncryptedEnvelope(data)) {
    return false;
  }

  return ENCRYPTED_BODY_PATHS.has(canonicalizePath(url));
}

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (shouldEncryptBody(config)) {
      const path = canonicalizePath(config.url);

      config.data = await encodeRequest(config.data as object, path);
      config.headers["X-Encrypted-Body"] = "1";
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
