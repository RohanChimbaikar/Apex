import { useQuery } from "@tanstack/react-query"
import { getTeams } from "../services/services"

export function useTeams() {
  const {
    data: teams,
    isPending,
    error,
    isRefetching,
    refetch: refetchTeams,
  } = useQuery({
    queryKey: ["teams"],
    queryFn: getTeams,
  })

  return { teams, isPending, error, refetchTeams,isRefetching }
}
