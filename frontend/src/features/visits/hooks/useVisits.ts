import { useQuery } from "@tanstack/react-query"
import { getVisits } from "../services/api.visits"

export function useVisits() {
  const {
    data: visits,
    isPending,
    error,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["visits"],
    queryFn: getVisits,
  })
  return { isPending, isError, error, visits, refetch }
}
