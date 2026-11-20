import { useQuery } from "@tanstack/react-query"
import { getTask } from "../services/tasks.api"

export function useTask(id: number) {
  const {
    data: task,
    isPending,
    isRefetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["tasks", id],
    queryFn: () => getTask(id),
  })
  return { task, isPending, error, refetch,isRefetching }
}
