import React, { useState } from "react"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useParams, Link } from "react-router"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Pencil,
  Save,
  Trash2Icon,
  User,
  Users,
  X,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogMedia,
} from "@/components/ui/alert-dialog"
import DatePicker from "@/components/DatePicker"
import DateTimePicker from "@/components/DateTimePicker"
import { useTask } from "../hooks/useTask"
import { Spinner } from "@/components/spinner"
import PageError from "@/components/PageError"
import { useTeams } from "@/features/teams/hooks/useTeams"
import { useEditTask } from "../hooks/useEditTask"
import { useDeleteTask } from "../hooks/useDeleteTask"

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
] as const

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
] as const

const taskSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Task name is required")
    .max(255, "Task name must be 255 characters or fewer"),
  description: z.string().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  team: z.number().int().positive("Please select a team"),
  assigned_to: z.number().int().nullable(),
  scheduled_at: z.string().nullable(),
  due_date: z.string().min(1, "Due date is required"),
})

type TaskFormValues = z.infer<typeof taskSchema>

const TaskDetailsPage = () => {
  const { taskId } = useParams<{ taskId: string }>()
  const [isEditing, setIsEditing] = useState(false)
  const numericTaskId = taskId ? Number(taskId) : 0

  const {
    task,
    isPending,
    isRefetching: isRefetchingTask,
    error,
    refetch: refetchTask,
  } = useTask(numericTaskId)

  const {
    teams,
    isPending: isPendingTeams,
    isRefetching: isRefetchingTeams,
    error: isErrorTeams,
    refetchTeams,
  } = useTeams()

  const { editTask, isPending: isPendingEdit } = useEditTask()
  const { deleteTask, isPendingDelete } = useDeleteTask()

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm<TaskFormValues, unknown, TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "PENDING",
      priority: "MEDIUM",
      team: 0,
      assigned_to: null,
      scheduled_at: null,
      due_date: "",
    },
    values: task
      ? {
          name: task.name,
          description: task.description ?? "",
          status: task.status ?? "PENDING",
          priority: task.priority ?? "MEDIUM",
          team: task.team,
          assigned_to: task.assigned_to ?? null,
          scheduled_at: task.scheduled_at ?? null,
          due_date: task.due_date,
        }
      : undefined,
    resetOptions: {
      keepDirtyValues: true,
    },
  })

  const selectedTeamId = useWatch({ control, name: "team" })
  const currentTeam = teams?.find((t) => t.id === selectedTeamId)
  const members = currentTeam?.members ?? []

  function handleCancel() {
    if (task) {
      reset({
        name: task.name,
        description: task.description ?? "",
        status: task.status ?? "PENDING",
        priority: task.priority ?? "MEDIUM",
        team: task.team,
        assigned_to: task.assigned_to ?? null,
        scheduled_at: task.scheduled_at ?? null,
        due_date: task.due_date,
      })
    }
    setIsEditing(false)
  }

  if (isPending || isPendingTeams) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4">
        <Spinner size="xl" />
        <p className="text-xs text-muted-foreground">Loading Task...</p>
      </div>
    )
  }

  if (error || isErrorTeams || !task || !teams) {
    return (
      <PageError
        title={error?.message || isErrorTeams?.message || "Failed to load task"}
        isRetrying={isRefetchingTask || isRefetchingTeams}
        onRetry={() => {
          refetchTask()
          refetchTeams()
        }}
      />
    )
  }

  function onSubmit(data: TaskFormValues) {
    // Client-side cross-field check before hitting the API
    if (
      data.assigned_to !== null &&
      !members.some((m) => m.id === data.assigned_to)
    ) {
      setError("assigned_to", {
        type: "manual",
        message: "Selected assignee does not belong to this team.",
      })
      return
    }

    editTask(
      {
        id: task!.id,
        data: {
          name: data.name,
          description: data.description ?? "",
          team: data.team,
          assigned_to: data.assigned_to,
          status: data.status,
          priority: data.priority,
          scheduled_at: data.scheduled_at,
          due_date: data.due_date,
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false)
        },
        onError: (err: unknown) => {
          const apiErrors = (
            err as { response?: { data?: Record<string, string[] | string> } }
          )?.response?.data

          if (apiErrors && typeof apiErrors === "object") {
            Object.entries(apiErrors).forEach(([field, messages]) => {
              const message = Array.isArray(messages) ? messages[0] : messages
              if (typeof message === "string" && field in taskSchema.shape) {
                setError(field as keyof TaskFormValues, {
                  type: "server",
                  message,
                })
              }
            })
          }
        },
      }
    )
  }

  function handleDelete(id: number) {
    deleteTask(id)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="min-w-0 flex-1 p-4">
      <Card className="rounded-xl">
        <CardHeader className="flex flex-col gap-3 border-b py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              nativeButton={false}
              className="size-7 shrink-0 rounded-full"
              render={<Link to="/tasks" />}
            >
              <ArrowLeft className="size-3.5" />
            </Button>

            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-semibold">
                  Task Details
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="rounded-full font-mono text-[10px]"
                >
                  #{task.id}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                {isEditing
                  ? "Editing task details — save changes when done."
                  : "View and manage task information."}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {!isEditing ? (
              <React.Fragment key="view-controls">
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={isPendingDelete}
                        className="h-7 rounded-full px-3 text-xs"
                      >
                        <Trash2Icon className="mr-1.5 size-3" />
                        {isPendingDelete ? "Deleting..." : "Delete Task"}
                      </Button>
                    }
                  />
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                        <Trash2Icon />
                      </AlertDialogMedia>
                      <AlertDialogTitle>
                        Delete Task &mdash; {task.name}?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this task.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel variant="outline">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        disabled={isPendingDelete}
                        onClick={() => handleDelete(numericTaskId)}
                      >
                        {isPendingDelete ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-7 rounded-full px-3.5 text-xs"
                >
                  <Pencil className="mr-1.5 size-3" />
                  Edit
                </Button>
              </React.Fragment>
            ) : (
              <React.Fragment key="edit-controls">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPendingEdit}
                  onClick={handleCancel}
                  className="h-7 rounded-full px-3 text-xs"
                >
                  <X className="mr-1.5 size-3" />
                  Cancel
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={isPendingEdit}
                  className="h-7 rounded-full px-3.5 text-xs"
                >
                  <Save className="mr-1.5 size-3" />
                  {isPendingEdit ? "Saving..." : "Save Changes"}
                </Button>
              </React.Fragment>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Column 1: Core Info & Shadcn Date Pickers */}
            <div className="space-y-3.5">
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name" className="text-xs">
                  Task Name
                </FieldLabel>
                <Input
                  id="name"
                  disabled={!isEditing || isPendingEdit}
                  aria-invalid={!!errors.name}
                  className="h-8 text-xs disabled:cursor-default disabled:opacity-100"
                  {...register("name")}
                />
                {errors.name && (
                  <FieldError className="text-[11px]">
                    {errors.name.message}
                  </FieldError>
                )}
              </Field>

              <Field data-invalid={!!errors.description}>
                <FieldLabel htmlFor="description" className="text-xs">
                  Description
                </FieldLabel>
                <Textarea
                  id="description"
                  rows={4}
                  disabled={!isEditing || isPendingEdit}
                  aria-invalid={!!errors.description}
                  className="text-xs disabled:cursor-default disabled:opacity-100"
                  {...register("description")}
                />
                {errors.description && (
                  <FieldError className="text-[11px]">
                    {errors.description.message}
                  </FieldError>
                )}
              </Field>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <Field data-invalid={!!errors.scheduled_at}>
                  <FieldLabel className="text-xs">Scheduled At</FieldLabel>
                  <Controller
                    name="scheduled_at"
                    control={control}
                    render={({ field }) => (
                      <div
                        className={
                          !isEditing || isPendingEdit
                            ? "pointer-events-none select-none"
                            : ""
                        }
                      >
                        <DateTimePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select date & time..."
                        />
                      </div>
                    )}
                  />
                  {errors.scheduled_at && (
                    <FieldError className="text-[11px]">
                      {errors.scheduled_at.message}
                    </FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors.due_date}>
                  <FieldLabel className="text-xs">Due Date</FieldLabel>
                  <Controller
                    name="due_date"
                    control={control}
                    render={({ field }) => (
                      <div
                        className={
                          !isEditing || isPendingEdit
                            ? "pointer-events-none select-none"
                            : ""
                        }
                      >
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select due date..."
                        />
                      </div>
                    )}
                  />
                  {errors.due_date && (
                    <FieldError className="text-[11px]">
                      {errors.due_date.message}
                    </FieldError>
                  )}
                </Field>
              </div>
            </div>

            {/* Column 2: Controller-wrapped Selects */}
            <div className="space-y-3.5">
              <Field data-invalid={!!errors.status}>
                <FieldLabel className="text-xs">Status</FieldLabel>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => {
                    const selectedStatus = STATUS_OPTIONS.find(
                      (s) => s.value === field.value
                    )
                    return (
                      <Select
                        disabled={!isEditing || isPendingEdit}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="h-8 w-full text-xs disabled:cursor-default disabled:opacity-100">
                          <SelectValue placeholder="Select status">
                            {selectedStatus?.label}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          {STATUS_OPTIONS.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                              className="text-xs"
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )
                  }}
                />
                {errors.status && (
                  <FieldError className="text-[11px]">
                    {errors.status.message}
                  </FieldError>
                )}
              </Field>

              <Field data-invalid={!!errors.priority}>
                <FieldLabel className="text-xs">Priority</FieldLabel>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => {
                    const selectedPriority = PRIORITY_OPTIONS.find(
                      (p) => p.value === field.value
                    )
                    return (
                      <Select
                        disabled={!isEditing || isPendingEdit}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="h-8 w-full text-xs disabled:cursor-default disabled:opacity-100">
                          <SelectValue placeholder="Select priority">
                            {selectedPriority?.label}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          {PRIORITY_OPTIONS.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                              className="text-xs"
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )
                  }}
                />
                {errors.priority && (
                  <FieldError className="text-[11px]">
                    {errors.priority.message}
                  </FieldError>
                )}
              </Field>

              <Field data-invalid={!!errors.team}>
                <FieldLabel className="text-xs">Team</FieldLabel>
                <Controller
                  name="team"
                  control={control}
                  render={({ field }) => {
                    const selectedTeam = teams.find((t) => t.id === field.value)
                    return (
                      <Select
                        disabled={!isEditing || isPendingEdit}
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(val) => {
                          field.onChange(Number(val))
                          setValue("assigned_to", null, { shouldDirty: true })
                        }}
                      >
                        <SelectTrigger className="h-8 w-full text-xs disabled:cursor-default disabled:opacity-100">
                          <SelectValue placeholder="Select team">
                            {selectedTeam?.name ?? task.team_name}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          {teams.map((team) => (
                            <SelectItem
                              key={team.id}
                              value={String(team.id)}
                              className="text-xs"
                            >
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )
                  }}
                />
                {errors.team && (
                  <FieldError className="text-[11px]">
                    {errors.team.message}
                  </FieldError>
                )}
              </Field>

              <Field data-invalid={!!errors.assigned_to}>
                <FieldLabel className="text-xs">Assigned To</FieldLabel>
                <Controller
                  name="assigned_to"
                  control={control}
                  render={({ field }) => {
                    const selectedMember = members.find(
                      (m) => m.id === field.value
                    )
                    return (
                      <Select
                        disabled={!isEditing || isPendingEdit}
                        value={
                          field.value !== null && field.value !== undefined
                            ? String(field.value)
                            : "unassigned"
                        }
                        onValueChange={(val) =>
                          field.onChange(
                            val === "unassigned" ? null : Number(val)
                          )
                        }
                      >
                        <SelectTrigger className="h-8 w-full text-xs disabled:cursor-default disabled:opacity-100">
                          <SelectValue placeholder="Unassigned">
                            {selectedMember?.full_name ??
                              (task.assigned_to_name || "Unassigned")}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          <SelectItem value="unassigned" className="text-xs">
                            Unassigned
                          </SelectItem>
                          {members.map((member) => (
                            <SelectItem
                              key={member.id}
                              value={String(member.id)}
                              className="text-xs"
                            >
                              {member.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )
                  }}
                />
                {errors.assigned_to && (
                  <FieldError className="text-[11px]">
                    {errors.assigned_to.message}
                  </FieldError>
                )}
              </Field>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t bg-muted/25 px-6 py-3 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              <span>Created</span>
              <strong className="font-medium text-foreground">
                {new Date(task.created_at).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </strong>
            </span>

            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              <span>Updated</span>
              <strong className="font-medium text-foreground">
                {new Date(task.updated_at).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
            <span className="flex items-center gap-1.5">
              <User className="size-3.5" />
              <span>Created by</span>
              <strong className="font-mono font-medium text-foreground">
                {task.created_by_name}
              </strong>
            </span>

            {task.updated_by_name !== null && (
              <span className="flex items-center gap-1.5">
                <Users className="size-3.5" />
                <span>Updated by</span>
                <strong className="font-mono font-medium text-foreground">
                  {task.updated_by_name}
                </strong>
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    </form>
  )
}

export default TaskDetailsPage