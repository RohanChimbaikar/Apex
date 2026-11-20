import { useMutation, useQueryClient } from "@tanstack/react-query"
import { editTask as editTaskApi } from "../services/tasks.api"
import { toast } from "@/components/ui/toast"
import type { TaskWritable } from "@/types/api"

interface EditTaskVariables {
  id: number
  data: TaskWritable
}

export function useEditTask() {
  const queryClient = useQueryClient()

  const {
    mutate: editTask,
    isPending,
    error,
  } = useMutation({
    mutationFn: ({ id, data }: EditTaskVariables) => editTaskApi(id, data),
    onSuccess: (_updatedTask, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({ queryKey: ["tasks", id] })

      toast.add({
        type: "success",
        title: "Task updated",
        description: "Task edited successfully.",
      })
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Failed to update task",
        description:
          err instanceof Error ? err.message : "Something went wrong.",
      })
    },
  })

  return { isPending, editTask, error }
}
