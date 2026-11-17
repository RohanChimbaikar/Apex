import { SidebarTrigger } from "./ui/sidebar"
import { Separator } from "./ui/separator"

export default function Navbar() {
  return (
    <header className="flex h-14 w-full shrink-0 items-center gap-3 border-b px-4 bg-sidebar">
      <SidebarTrigger />

      <Separator orientation="vertical" className="h-full" />

      {/* Breadcrumbs or page title will go here */}
    </header>
  )
}
