import { format, parseISO } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  ariaInvalid?: boolean
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "Select date...",
  ariaInvalid,
}: DatePickerProps) {
  const selectedDate = value ? parseISO(`${value}T00:00:00`) : undefined

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={`w-full justify-start text-left font-normal ${
              ariaInvalid
                ? "border-destructive ring-1 ring-destructive focus-visible:ring-destructive"
                : ""
            }`}
            aria-invalid={ariaInvalid}
          />
        }
      >
        <CalendarIcon className="mr-2 size-4" />
        {selectedDate ? (
          format(selectedDate, "PPP")
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (date) onChange(format(date, "yyyy-MM-dd"))
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
