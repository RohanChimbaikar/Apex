import { Navigate, Outlet, useLocation } from "react-router"
import { useAuth } from "../hooks/useAuth"
import { Spinner } from "@/components/spinner"

const ProtectedRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  console.log("Auth state:", {
    isAuthenticated,
    isLoading,
  })

  if (isLoading) return <Spinner size="md" />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
export default ProtectedRoutes
