import api from "@/lib/api"
import type { TeamOption, TeamType } from "./types"

export async function getTeams() {
  const { data } = await api.get<TeamType[]>("/organization/teams/")
  return data
}

export async function getTeamOptions() {
  const { data } = await api.get<TeamOption[]>("/organization/teams-options/")

  return data
}
