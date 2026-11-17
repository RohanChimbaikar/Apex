import { createContext, useEffect, useState, type ReactNode } from "react"

import type { CurrentUser } from "@/types/api/types.gen"
import { getCurrentUser, refreshSession } from "../api/auth.api"
import { setAccessToken, clearAccessToken } from "@/lib/token"
import { useQueryClient } from "@tanstack/react-query"

interface AuthContextType {
  user: CurrentUser | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: CurrentUser | null) => void
}

interface ProviderProps {
  children: ReactNode
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: ProviderProps) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const queryClient = useQueryClient()
  // Restore the user's session when the application loads.
  useEffect(() => {
    async function restoreSession() {
      try {
        const data = await refreshSession()

        setAccessToken(data.access)

        const currentUser = await getCurrentUser()

        setUser(currentUser)
        queryClient.setQueryData(["user"], currentUser)
      } catch {
        clearAccessToken()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    setUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
