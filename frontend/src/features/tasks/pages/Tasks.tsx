import PageContainer from "@/components/PageContainer"
import { Button } from "@/components/ui/button"
import StatCard from "@/features/dashboard/components/StatCard"
import Stats from "@/features/dashboard/components/Stats"
import { PlusIcon } from "lucide-react"

export default function Tasks() {
  return (
    <PageContainer
      title="Tasks"
      description="Create, assign and manage your team's tasks."
      actions={
        <Button>
          <PlusIcon />
          Create Task
        </Button>
      }
    >
      <Stats>
        <StatCard />
      </Stats>
    </PageContainer>
  )
}
