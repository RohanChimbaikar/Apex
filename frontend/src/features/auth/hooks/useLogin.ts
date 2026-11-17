import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"

import type { ApexTokenObtainPair } from "@/types/api"
import { setAccessToken } from "@/lib/token"
import { useAuth } from "./useAuth"

import {
  getCSRFCookie,
  getCurrentUser,
  login as loginApi,
} from "../api/auth.api"

export function useLogin() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const queryClient = useQueryClient()

  const { mutateAsync: login, isPending } = useMutation({
    mutationFn: async (credentials: ApexTokenObtainPair) => {
      await getCSRFCookie()

      const response = await loginApi(credentials)

      setAccessToken(response.access)

      const user = await getCurrentUser()

      return user
    },

    onSuccess: (user) => {
      setUser(user)
      queryClient.setQueryData(["user"], user)
      navigate("/dashboard")
    },
  })

  return {
    login,
    isPending,
  }
}
