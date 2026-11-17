import { useQuery } from "@tanstack/react-query"
import { getCurrentUser } from "../api/auth.api"

export function useCurrentUser(enabled: boolean) {
  const {
    data: user,
    isPending,
    error,
  } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
    enabled,
  })

  return { user, isPending, error }
}
