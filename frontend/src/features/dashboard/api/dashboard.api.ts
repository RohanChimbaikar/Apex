import { api } from "@/lib/axios"

export async function getStats() {
  const response = await api.get("/dashboard/")
  return response.data
}
