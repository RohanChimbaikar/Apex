import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createTask as createTaskApi } from "../services/tasks.api"
import type { TaskWritable } from "@/types/api"
import { toast } from "@/components/ui/toast"

export function useCreateTask() {
  const queryClient = useQueryClient()

  const {
    mutate: createTask,
    isPending,

    error,
  } = useMutation({
    mutationKey: ["tasks", "create"],
    mutationFn: (task: TaskWritable) => createTaskApi(task),
    onSuccess: (data) => {
      toast.add({
        type: "success",
        description: `Task ${data.name} created sucessfully.`,
      })
      return queryClient.invalidateQueries({
        queryKey: ["tasks"],
      })
    },
    onError: (error) => {
      toast.add({
        type: "error",
        description: error.message || "Task could not be created.",
      })
    },
  })

  return {
    createTask,
    isPending,
    error,
  }
}
