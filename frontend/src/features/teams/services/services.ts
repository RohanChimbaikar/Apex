import { api } from "@/lib/axios"
import type { Team } from "@/types/api"

export async function getTeams() {
  const response = await api.get<Team[]>("/organization/teams/")

  return response.data
}

export async function getTeam(id: number) {
  const response = await api.get<Team>(`/organization/teams/${id}`)

  return response.data
}
