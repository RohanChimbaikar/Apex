import { api } from "@/lib/axios"
import { setAccessToken } from "@/lib/token"
import type { ApexTokenObtainPair } from "@/types/api"
import type { CurrentUser, LoginResponse } from "@/types/api/types.gen"

export async function login(credentials: ApexTokenObtainPair) {
  const response = await api.post<LoginResponse>("/api/login/", credentials)
  return response.data
}

export async function logout() {
  await getCSRFCookie()
  const response = await api.post("/api/logout/")
  return response.data
}

export async function getCSRFCookie() {
  const response = await api.get("/api/csrf/")
  return response.data
}

export async function getCurrentUser() {
  const response = await api.get<CurrentUser>("/api/me/")
  return response.data
}

export async function refreshAcessToken(): Promise<string> {
  await getCSRFCookie()

  const response = await api.post<{ access: string }>("/api/token/refresh/")

  setAccessToken(response.data.access)

  return response.data.access
}

export async function refreshSession() {
  await getCSRFCookie()

  const response = await api.post<{ access: string }>("/api/token/refresh/")

  return response.data
}
