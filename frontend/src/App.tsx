import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Outlet } from "react-router"
import Navbar from "./components/Navbar"

export default function App() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 bg-workspace">
        <Navbar />
        <Outlet />
      </main>
    </SidebarProvider>
  )
}
