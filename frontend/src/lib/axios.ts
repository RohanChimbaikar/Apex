import axios, { type InternalAxiosRequestConfig } from "axios"

import { getAccessToken, setAccessToken, clearAccessToken } from "./token"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

// Track whether a request has already been retried.
type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

// Shared promise for concurrent refresh requests.
let refreshPromise: Promise<string> | null = null

// Obtain a new access token using the HTTP-only refresh cookie.
async function refreshAccessToken(): Promise<string> {
  // Ensure the CSRF cookie exists.
  await api.get("/api/csrf/")

  const response = await api.post<{ access: string }>("/api/token/refresh/")

  const newAccessToken = response.data.access

  setAccessToken(newAccessToken)

  return newAccessToken
}

// REQUEST INTERCEPTOR
api.interceptors.request.use((config) => {
  const token = getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error)
    }

    const url = originalRequest.url ?? ""

    // Never attempt to refresh a failed login or refresh request.
    if (url.includes("/api/login/") || url.includes("/api/token/refresh/")) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      // Start one refresh operation, or reuse the existing one.
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null
        })
      }

      const newAccessToken = await refreshPromise

      // Update the original request with the new access token.
      originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`)

      // Retry the original request.
      return api(originalRequest)
    } catch (refreshError) {
      clearAccessToken()

      return Promise.reject(refreshError)
    }
  }
)
