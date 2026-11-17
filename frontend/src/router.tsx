import { createBrowserRouter, Navigate } from "react-router"

import Login from "./features/auth/pages/Login"
import App from "./App"

import Tasks from "./features/tasks/pages/Tasks"
import Dashboard from "./features/dashboard/pages/Dashboard"
import Visits from "./features/visits/pages/Visits"
import Teams from "./features/teams/pages/Teams"
import ProtectedRoutes from "./features/auth/components/ProtectedRoutes"

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    Component: ProtectedRoutes,
    children: [
      {
        path: "/",
        Component: App,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: "dashboard",
            Component: Dashboard,
          },
          {
            path: "tasks",
            Component: Tasks,
          },
          {
            path: "visits",
            Component: Visits,
          },
          {
            path: "teams",
            Component: Teams,
          },
        ],
      },
    ],
  },
])
