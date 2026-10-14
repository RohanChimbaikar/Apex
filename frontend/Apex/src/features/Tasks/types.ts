type Status =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETE"
  | "CANCELLED"
  | "PARTIALLY_COMPLETE"
  | "ON_HOLD"

type Priority = "HIGH" | "MEDIUM" | "LOW"

export type Task = {
  id: number
  name: string
  description: string | null
  status: Status
  priority: Priority
  deadline: string | null
  created_at: string
  updated_at: string
  team: number
  team_name: string
  assigned_to: number | null
  assigned_to_name: string | null
  created_by: number | null
  last_updated_by: number | null
}
