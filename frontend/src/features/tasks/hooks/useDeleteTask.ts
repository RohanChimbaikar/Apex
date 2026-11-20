import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteTask as deleteTaskApi } from "../services/tasks.api"
import { useNavigate } from "react-router"
import { toast } from "@/components/ui/toast"

export function useDeleteTask() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const {
    mutate: deleteTask,
    isPending: isPendingDelete,
    error: deleteTaskError,
  } = useMutation({
    mutationFn: (id: number) => deleteTaskApi(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({
        queryKey: ["tasks", id],
      })
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      })
      navigate(-1)
      toast.add({
        type: "success",
        title: "Task deleted",
        description: "The task has been permanently removed.",
      })
    },
  })
  return {
    deleteTask,
    isPendingDelete,
    deleteTaskError,
  }
}
