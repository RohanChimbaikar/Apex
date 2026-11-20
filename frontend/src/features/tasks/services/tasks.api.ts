import { api } from "@/lib/axios"
import type { Task, TaskWritable } from "@/types/api"

export async function getTasks() {
  const response = await api.get<Task[]>("/tasks/")

  return response.data
}

export async function createTask(task: TaskWritable) {
  const response = await api.post("/tasks/", task)
  return response.data
}

export async function getTask(id: number | undefined) {
  const response = await api.get<Task>(`/tasks/${id}/`)

  return response.data
}

export async function editTask(id: number, data: TaskWritable) {
  const response = await api.patch(`/tasks/${id}/`, data)

  return response.data
}

export async function deleteTask(id: number): Promise<void> {
  if (!id) {
    throw new Error("Task ID is required")
  }

  await api.delete(`/tasks/${id}/`)
}
