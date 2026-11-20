import PageContainer from "@/components/PageContainer"
import VisitsContent from "../components/VisitsContent"
import { useDashboard } from "@/features/dashboard/hooks/useDashboard"
import PageLoader from "@/components/PageLoader"
import PageError from "@/components/PageError"
import { useVisits } from "../hooks/useVisits"
import { DataTable } from "@/components/data-table"
import { columns } from "../table/columns"

export default function Visits() {
  const { data, isPending, isError, error } = useDashboard()
  const {
    visits,
    isPending: isPendingVisits,
    isError: isErrorVisits,
    error: visiterror,
  } = useVisits()

  if (isPending || isPendingVisits) {
    return <PageLoader />
  }
  if (isError || isErrorVisits) {
    return <PageError message={error?.message || visiterror?.message} />
  }

  return (
    <PageContainer title="Visits" description="Manage your team's visits">
      <VisitsContent visitStats={data.visits} />
      <DataTable columns={columns} data={visits} />
    </PageContainer>
  )
}
