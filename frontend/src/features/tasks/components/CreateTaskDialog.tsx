import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { PlusIcon } from "lucide-react"
import DatePicker from "@/components/DatePicker"
import DateTimePicker from "@/components/DateTimePicker"
import PriorityIndicator from "@/components/PriorityIndicator"

import { Controller, useForm, useWatch } from "react-hook-form"
import type { TaskWritable } from "@/types/api"
import { zodResolver } from "@hookform/resolvers/zod"
import { zTaskWritable } from "@/types/api/zod.gen"
import { useCreateTask } from "../hooks/useCreateTask"
import { useTeams } from "@/features/teams/hooks/useTeams"
import { Spinner } from "@/components/spinner"
import { useState } from "react"

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
] as const

const PRIORITY_OPTIONS = [
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
] as const

export default function CreateTaskDialog() {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm<TaskWritable>({
    resolver: zodResolver(zTaskWritable),
    defaultValues: {
      status: "PENDING",
      priority: "MEDIUM",
      assigned_to: null,
      scheduled_at: null,
    },
  })

  const { createTask, isPending } = useCreateTask()
  const { teams, isPending: isPendingTeams } = useTeams()

  const selectedTeamId = useWatch({ control, name: "team" })
  const currentTeam = teams?.find((t) => t.id === selectedTeamId)
  const members = currentTeam?.members ?? []

  function onSubmit(data: TaskWritable) {
    createTask(data, {
      onSuccess: () => {
        setOpen(false)
        reset()
      },
      onError: (err: unknown) => {
        const apiErrors = (
          err as { response?: { data?: Record<string, string[] | string> } }
        )?.response?.data

        if (apiErrors && typeof apiErrors === "object") {
          Object.entries(apiErrors).forEach(([field, messages]) => {
            const message = Array.isArray(messages) ? messages[0] : messages
            if (typeof message === "string") {
              setError(field as keyof TaskWritable, {
                type: "server",
                message,
              })
            }
          })
        }
      },
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) reset()
      }}
    >
      <DialogTrigger render={<Button />}>
        <PlusIcon />
        Create Task
      </DialogTrigger>

      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-4xl">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-xl">Create a task</DialogTitle>
          <DialogDescription>Add a new task to your team.</DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Scrollable form fields */}
          <div className="min-h-0 flex-1 overflow-y-auto py-6 pr-2">
            <FieldGroup>
              {/* Task name */}
              <Field>
                <Label htmlFor="name">Task Name *</Label>
                <Input
                  id="name"
                  aria-invalid={!!errors.name}
                  className="mx-1"
                  placeholder="Enter task name..."
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </Field>

              {/* Description */}
              <Field>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  aria-invalid={!!errors.description}
                  placeholder="Describe the task, requirements, or any important details..."
                  rows={3}
                  className="max-h-40 min-h-24 resize-none overflow-y-auto"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Team */}
                <Field>
                  <Label htmlFor="team">Team *</Label>
                  <Controller
                    name="team"
                    control={control}
                    render={({ field }) => {
                      const selectedTeam = teams?.find(
                        (t) => t.id === field.value
                      )
                      return (
                        <Select
                          disabled={isPendingTeams}
                          value={field.value ? String(field.value) : ""}
                          onValueChange={(value) => {
                            field.onChange(Number(value))
                            setValue("assigned_to", null)
                          }}
                        >
                          <SelectTrigger
                            id="team"
                            className="mx-1 w-full"
                            aria-invalid={!!errors.team}
                          >
                            <SelectValue
                              placeholder={
                                isPendingTeams
                                  ? "Loading teams..."
                                  : "Select team..."
                              }
                            >
                              {selectedTeam?.name}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {(teams ?? []).map((team) => (
                              <SelectItem key={team.id} value={String(team.id)}>
                                {team.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )
                    }}
                  />
                  {errors.team && (
                    <p className="text-sm text-destructive">
                      {errors.team.message}
                    </p>
                  )}
                </Field>

                {/* Assigned to */}
                <Field>
                  <Label htmlFor="assigned_to">Assigned To</Label>
                  <Controller
                    name="assigned_to"
                    control={control}
                    render={({ field }) => {
                      const selectedMember = members.find(
                        (m) => m.id === field.value
                      )
                      return (
                        <Select
                          disabled={!selectedTeamId || isPendingTeams}
                          value={
                            field.value !== null && field.value !== undefined
                              ? String(field.value)
                              : "unassigned"
                          }
                          onValueChange={(value) =>
                            field.onChange(
                              value === "unassigned" ? null : Number(value)
                            )
                          }
                        >
                          <SelectTrigger
                            id="assigned_to"
                            className="w-full"
                            aria-invalid={!!errors.assigned_to}
                          >
                            <SelectValue
                              placeholder={
                                !selectedTeamId
                                  ? "Select a team first..."
                                  : "Unassigned"
                              }
                            >
                              {selectedMember?.full_name ??
                                (!selectedTeamId
                                  ? "Select a team first..."
                                  : "Unassigned")}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">
                              Unassigned
                            </SelectItem>
                            {members.map((member) => (
                              <SelectItem
                                key={member.id}
                                value={String(member.id)}
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
                    <p className="text-sm text-destructive">
                      {errors.assigned_to.message}
                    </p>
                  )}
                </Field>

                {/* Priority */}
                <Field>
                  <Label htmlFor="priority">Priority *</Label>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="priority" className="w-full">
                          <SelectValue>
                            {field.value && (
                              <PriorityIndicator priority={field.value} />
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <PriorityIndicator priority={option.value} />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.priority && (
                    <p className="text-sm text-destructive">
                      {errors.priority.message}
                    </p>
                  )}
                </Field>

                {/* Status */}
                <Field>
                  <Label htmlFor="status">Status *</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => {
                      const selectedStatus = STATUS_OPTIONS.find(
                        (s) => s.value === field.value
                      )
                      return (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger id="status" className="w-full">
                            <SelectValue>{selectedStatus?.label}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
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
                    <p className="text-sm text-destructive">
                      {errors.status.message}
                    </p>
                  )}
                </Field>

                {/* Scheduled at */}
                <Field>
                  <Label>Scheduled At</Label>
                  <Controller
                    name="scheduled_at"
                    control={control}
                    render={({ field }) => (
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select date and time..."
                      />
                    )}
                  />
                  {errors.scheduled_at && (
                    <p className="text-sm text-destructive">
                      {errors.scheduled_at.message}
                    </p>
                  )}
                </Field>

                {/* Due date */}
                <Field>
                  <Label>Due Date *</Label>
                  <Controller
                    name="due_date"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select due date..."
                        ariaInvalid={!!errors.due_date}
                      />
                    )}
                  />
                  {errors.due_date && (
                    <p className="text-sm text-destructive">
                      {errors.due_date.message}
                    </p>
                  )}
                </Field>
              </div>
            </FieldGroup>
          </div>

          {/* Fixed footer */}
          <DialogFooter className="shrink-0 border-t pt-4">
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <PlusIcon />
                  Create Task
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
