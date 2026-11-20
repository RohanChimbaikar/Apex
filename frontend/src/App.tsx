import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Outlet } from "react-router"
import Navbar from "./components/Navbar"

export default function App() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="min-w-0 flex-1 bg-workspace">
        <Navbar />

        <div className="w-full min-w-0">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  )
}
