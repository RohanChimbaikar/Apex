import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { formSchema, type FormValues } from "./TaskSchema"

import { toast } from "@/components/ui/toast"
import type { UseMutateAsyncFunction } from "@tanstack/react-query"
import { useTeamOptions } from "@/features/Teams/hooks/useTeamOptions"
import type { TeamOption } from "@/features/Teams/types"
import { Spinner } from "@/components/ui/spinner"

type teamType = {
  label: string
  value: string
}

const statusItems = [
  { label: "Pending", value: "PENDING" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Complete", value: "COMPLETE" },
  { label: "Partially Complete", value: "PARTIALLY_COMPLETE" },
  { label: "On Hold", value: "ON_HOLD" },
  { label: "Cancelled", value: "CANCELLED" },
]

const priorityItems = [
  { label: "High", value: "HIGH" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Low", value: "LOW" },
]

const assigneeItems = [
  { label: "User 1", value: "1" },
  { label: "User 2", value: "2" },
]

type TaskFormProps = {
  onSuccess: () => void

  createTask: UseMutateAsyncFunction<unknown, Error, FormValues, unknown>
}

export default function TaskForm({ onSuccess, createTask }: TaskFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "PENDING",
      priority: "MEDIUM",
      deadline: "",
      team: 0,
      assigned_to: 0,
    },
  })
  const { teamOptions = [], isPending: isPendingOptions } = useTeamOptions()

  const teamItems: teamType[] = teamOptions.map((team: TeamOption) => ({
    label: team.name,
    value: String(team.id),
  }))

  async function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      deadline: new Date(values.deadline).toISOString(),
    }
    try {
      await toast.promise(createTask(payload), {
        loading: "Creating task...",
        success: "Task created successfully!",
        error: "Failed to create task.",
      })

      form.reset()
      onSuccess()
    } catch (error) {
      // Keep the drawer open if creation fails.
      console.error("Failed to create task:", error)
    }
  }

  // Later: call your createTask mutation here.

  if (isPendingOptions) return <Spinner scale={20} />
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
      id="create-task-form"
    >
      {/* Task name */}
      <Field>
        <FieldLabel htmlFor="name">Task Name</FieldLabel>
        <Input
          id="name"
          placeholder="Task name..."
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <FieldError errors={[form.formState.errors.name]} />
        )}
      </Field>

      {/* Description */}
      <Field>
        <FieldLabel htmlFor="description">Description</FieldLabel>
        <Textarea
          id="description"
          placeholder="Describe the task..."
          {...form.register("description")}
        />
        {form.formState.errors.description && (
          <FieldError errors={[form.formState.errors.description]} />
        )}
      </Field>

      {/* Status */}
      <Field>
        <FieldLabel>Status</FieldLabel>
        <Controller
          name="status"
          control={form.control}
          render={({ field }) => (
            <Select
              items={statusItems}
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {statusItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.status && (
          <FieldError errors={[form.formState.errors.status]} />
        )}
      </Field>

      {/* Priority */}
      <Field>
        <FieldLabel>Task Priority</FieldLabel>
        <Controller
          name="priority"
          control={form.control}
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="flex flex-wrap gap-4"
            >
              {priorityItems.map((item) => (
                <div key={item.value} className="flex items-center gap-2">
                  <RadioGroupItem
                    value={item.value}
                    id={`priority-${item.value}`}
                  />
                  <Label htmlFor={`priority-${item.value}`}>{item.label}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
        />
        {form.formState.errors.priority && (
          <FieldError errors={[form.formState.errors.priority]} />
        )}
      </Field>

      {/* Deadline */}
      <Field>
        <FieldLabel htmlFor="deadline">Deadline</FieldLabel>
        <Input
          id="deadline"
          type="datetime-local"
          {...form.register("deadline")}
        />
        {form.formState.errors.deadline && (
          <FieldError errors={[form.formState.errors.deadline]} />
        )}
      </Field>

      {/* Team */}
      <Field>
        <FieldLabel>Select Team</FieldLabel>
        <Controller
          name="team"
          control={form.control}
          render={({ field }) => (
            <Select
              items={teamItems}
              value={field.value ? String(field.value) : ""}
              onValueChange={(value) => field.onChange(Number(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a team" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {teamItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.team && (
          <FieldError errors={[form.formState.errors.team]} />
        )}
      </Field>

      {/* Assignee */}
      <Field>
        <FieldLabel>Assign To</FieldLabel>
        <Controller
          name="assigned_to"
          control={form.control}
          render={({ field }) => (
            <Select
              items={assigneeItems}
              value={field.value ? String(field.value) : ""}
              onValueChange={(value) => field.onChange(Number(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose an assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {assigneeItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.assigned_to && (
          <FieldError errors={[form.formState.errors.assigned_to]} />
        )}
      </Field>
    </form>
  )
}
