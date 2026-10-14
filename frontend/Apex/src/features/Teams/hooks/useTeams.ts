import { useQuery } from "@tanstack/react-query"
import { getTeams } from "@/features/Teams/services"

export function useTeams() {
  const {
    data: teams,
    error,
    isPending,
  } = useQuery({
    queryKey: ["teams"],
    queryFn: getTeams,
  })

  return { teams, isPending, error }
}
