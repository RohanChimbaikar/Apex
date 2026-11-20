import { useQuery } from "@tanstack/react-query"
import { getTasks } from "../services/tasks.api"

export function useTasks() {
  const { data, isError, error, isPending, refetch } = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  })

  return { data, isError, error, isPending, refetch }
}
