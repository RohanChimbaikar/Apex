import PageContainer from "@/components/PageContainer"
import PageHeader from "@/components/PageHeader"
import PageHeaderButton from "@/components/PageHeaderButton"
import CreateTaskDrawer from "@/features/Tasks/Drawer/CreateTaskDrawer"

import { columns } from "@/features/Tasks/Tasks-Table/columns"
import { DataTable } from "@/features/Tasks/Tasks-Table/data-table"
import { useTasks } from "@/features/Tasks/useTasks"
import { PlusIcon } from "lucide-react"
import { useState } from "react"

export default function Tasks() {
  const [createOpen, setCreateOpen] = useState(false)
  const { tasks } = useTasks()

  return (
    <>
      <PageHeader
        title="Tasks"
        description=" Create assign and track field tasks accross all regions"
      >
        <PageHeaderButton onClick={() => setCreateOpen(true)}>
          <PlusIcon className="h-4 w-4" />
          Create Task
        </PageHeaderButton>
      </PageHeader>
      <PageContainer>
        <DataTable columns={columns} data={tasks ?? []} />
      </PageContainer>

      <CreateTaskDrawer open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}
