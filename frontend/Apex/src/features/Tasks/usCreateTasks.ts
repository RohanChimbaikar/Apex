import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createTask as createTaskAPI } from "./services"

export function useCreateTask() {
  const queryClient = useQueryClient()

  const { mutateAsync: createTask, isPending } = useMutation({
    mutationFn: createTaskAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
  })

  return { createTask, isPending }
}
