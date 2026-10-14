import { createBrowserRouter } from "react-router"

import App from "./App"
import Dashboard from "./pages/Dashboard"
import Tasks from "./pages/Tasks"
import Regions from "./pages/Regions"
import Teams from "./pages/Teams"
import Visits from "./pages/Visits"

export const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      {
        index: true,
        Component: Dashboard,
      },
      {
        path: "/tasks",
        Component: Tasks,
      },
      {
        path: "/regions",
        Component: Regions,
      },
      {
        path: "/teams",
        Component: Teams,
      },
      {
        path: "/visits",
        Component: Visits,
      },
    ],
  },
])
