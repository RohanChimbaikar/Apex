import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Outlet } from "react-router"

export default function App() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="min-w-0 flex-1">
        <SidebarTrigger />
        <Outlet />
      </main>
    </SidebarProvider>
  )
}
