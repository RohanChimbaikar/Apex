import { format } from "date-fns"
import { CalendarIcon, ClockIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateTimePickerProps {
  value?: string | null
  onChange: (value: string | null) => void
  placeholder?: string
}

export default function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date and time...",
}: DateTimePickerProps) {
  const selectedDate = value ? new Date(value) : undefined

  const timeValue =
    selectedDate && !isNaN(selectedDate.getTime())
      ? format(selectedDate, "HH:mm")
      : "09:00"

  function updateDateTime(date: Date, time: string) {
    const [hours, minutes] = time.split(":").map(Number)

    const updatedDate = new Date(date)
    updatedDate.setHours(hours, minutes, 0, 0)

    onChange(updatedDate.toISOString())
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          />
        }
      >
        <CalendarIcon className="mr-2 size-4" />
        {selectedDate && !isNaN(selectedDate.getTime()) ? (
          format(selectedDate, "PPP, hh:mm a")
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) updateDateTime(date, timeValue)
            }}
          />

          <div className="border-t pt-3">
            <label
              htmlFor="scheduled-time"
              className="mb-2 flex items-center gap-2 text-sm font-medium"
            >
              <ClockIcon className="size-4" />
              Select time
            </label>

            <Input
              id="scheduled-time"
              type="time"
              value={timeValue}
              onChange={(e) => {
                if (selectedDate) {
                  updateDateTime(selectedDate, e.target.value)
                }
              }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
