import PageContainer from "@/components/PageContainer"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"

export default function Teams() {
  return (
    <PageContainer
      title="Team"
      description="Create, assign and manage teams."
      actions={
        <Button>
          <PlusIcon />
          Create Team
        </Button>
      }
    ></PageContainer>
  )
}
