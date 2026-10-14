import api from "@/lib/api"
import type { Task } from "./types"
import type { FormValues } from "./Drawer/TaskSchema"
import axios from "axios"

export async function getTasks() {
  const response = await api.get<Task[]>("/tasks")

  const data = response.data

  return data
}

export async function createTask(task: FormValues) {
  try {
    const response = await api.post("/tasks/", task)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API validation error:", error.response?.data)
    }

    throw error
  }
}
