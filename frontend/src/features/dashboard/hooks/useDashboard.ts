import { useQuery } from "@tanstack/react-query"
import { getStats } from "../api/dashboard.api"

export const DASHBOARD_QUERY_KEY = ["dashboard"] as const

export function useDashboard() {
  const { data, isPending, error, isError, refetch } = useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: getStats,
  })

  return { data, isPending, error, isError, refetch }
}
