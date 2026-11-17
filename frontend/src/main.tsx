import { createRoot } from "react-dom/client"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import "./index.css"
import { ThemeProvider } from "@/components/theme-provider"
import { RouterProvider } from "react-router/dom"
import { router } from "./router"
import { queryClient } from "./lib/query-client"
import { AuthProvider } from "./features/auth/context/AuthProvider"


createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
)
