import { useQuery } from "@tanstack/react-query"
import { getTasks } from "./services"

export function useTasks() {
  const {
    data: tasks,
    isPending,
    error,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  })

  return { tasks, isPending, error }
}
