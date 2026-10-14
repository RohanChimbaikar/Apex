import { useQuery } from "@tanstack/react-query"
import { getTeamOptions } from "../services"

export function useTeamOptions() {
  const {
    data: teamOptions,
    error,
    isPending,
  } = useQuery({
    queryKey: ["team-options"],
    queryFn: getTeamOptions,
  })

  return { teamOptions, error, isPending }
}
