import { api } from "@/lib/axios"
import type { Visit } from "@/types/api"

export async function getVisits() {
  const response = await api.get<Visit[]>("/visits/")

  return response.data
}
