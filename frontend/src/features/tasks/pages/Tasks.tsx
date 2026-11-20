import PageContainer from "@/components/PageContainer"
import PageError from "@/components/PageError"
import PageLoader from "@/components/PageLoader"

import { useDashboard } from "@/features/dashboard/hooks/useDashboard"

import Content from "../components/Content"
import { useTasks } from "../hooks/useTasks"
import { Dialog } from "@/components/ui/dialog"
import CreateTaskDialog from "../components/CreateTaskDialog"

export default function Tasks() {
  const { data, isPending, isError, refetch, error } = useDashboard()

  const {
    data: tasksData,
    isPending: isPendingTasks,
    error: tasksError,
    isError: isErrorTasks,
    refetch: refetchTasks,
  } = useTasks()

  if (isPending || isPendingTasks) {
    return <PageLoader />
  }

  if (isError || !data || isErrorTasks || !tasksData) {
    return (
      <PageError
        onRetry={() => {
          refetch()
          refetchTasks()
        }}
        message={error?.message || tasksError?.message}
      />
    )
  }

  return (
    <PageContainer
      title="Tasks"
      description="Create, assign and manage your team's tasks."
      actions={<CreateTaskDialog />}
    >
      <Dialog />
      <Content taskStats={data.tasks} tasksData={tasksData} />
    </PageContainer>
  )
}
