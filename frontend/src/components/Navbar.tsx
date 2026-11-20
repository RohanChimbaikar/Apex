import { SidebarTrigger } from "./ui/sidebar"
import { Separator } from "./ui/separator"
import { ModeToggle } from "./mode-toggle"

export default function Navbar() {
  return (
    <header className="flex h-12 w-full shrink-0 items-center gap-3 border-b bg-sidebar px-4">
      <SidebarTrigger />

      <Separator orientation="vertical" className="h-full" />

      {/* Breadcrumbs or page title will go here */}

      <div className="ml-auto">
        <ModeToggle  />
      </div>
    </header>
  )
}
