import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FilterProps {
  value: string
  onValueChange: (value: string) => void
  counts: {
    all: number
    overdue: number
    "due-today": number
    upcoming: number
  }
}

export function FilterTabs({ value, onValueChange, counts }: FilterProps) {
  return (
    <Tabs defaultValue="all" value={value} onValueChange={onValueChange}>
      <TabsList>
        <TabsTrigger value="all" className="text-xs">
          All ({counts.all})
        </TabsTrigger>
        <TabsTrigger value="overdue" className="text-xs">
          Overdue({counts.overdue})
        </TabsTrigger>
        <TabsTrigger value="due-today" className="text-xs">
          Due Today ({counts["due-today"]})
        </TabsTrigger>
        <TabsTrigger value="upcoming" className="text-xs">
          Upcoming ({counts.upcoming})
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
