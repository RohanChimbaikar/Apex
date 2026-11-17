import { useMutation, useQueryClient } from "@tanstack/react-query"
import { logout as logoutApi } from "../api/auth.api"
import { clearAccessToken } from "@/lib/token"
import { useAuth } from "./useAuth"
import { useNavigate } from "react-router"

export function useLogout() {
  const { setUser } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const {
    mutateAsync: logout,
    isPending,
    error,
  } = useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      clearAccessToken()
      setUser(null)
      queryClient.removeQueries({ queryKey: ["user"] })
      navigate("/login", { replace: true })
    },
    onError: (error) => {
      console.error("Logout failed:", error)
    },
  })

  return { isPending, logout, error }
}
