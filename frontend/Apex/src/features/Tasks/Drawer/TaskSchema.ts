import { z } from "zod"

export const formSchema = z.object({
  name: z.string().trim().min(1, "Task name is required"),
  description: z.string().trim().min(1, "Description is required"),

  status: z.enum([
    "PENDING",
    "IN_PROGRESS",
    "COMPLETE",
    "PARTIALLY_COMPLETE",
    "ON_HOLD",
    "CANCELLED",
  ]),

  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),

  deadline: z
    .string()
    .min(1, "Deadline is required")
    .refine(
      (value) => !Number.isNaN(new Date(value).getTime()),
      "Enter a valid deadline"
    ),

  team: z.number().int().positive("Select a team"),
  assigned_to: z.number().int().positive("Select an assignee"),
})

export type FormValues = z.infer<typeof formSchema>
