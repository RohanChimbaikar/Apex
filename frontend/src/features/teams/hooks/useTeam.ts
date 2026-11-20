import { useQuery } from "@tanstack/react-query"
import { getTeam } from "../services/services"

export function useTeam(id: number | undefined | null) {
  const {
    data: team,
    isPending,
    error,
  } = useQuery({
    queryKey: ["teams", id],
    queryFn: () => getTeam(id!),
    enabled: Boolean(id),
  })

  return { team, isPending, error }
}
