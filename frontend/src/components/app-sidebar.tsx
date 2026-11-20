import * as React from "react"
import {
  LayoutDashboard,
  ClipboardList,
  ChartBar,
  MapPinned,
  Users,
  Settings2,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
 
  useSidebar,
} from "@/components/ui/sidebar"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { useAuth } from "@/features/auth/hooks/useAuth"

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <LayoutDashboard />,
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: <ClipboardList />,
  },
  {
    title: "Organization",
    url: "/organization",
    icon: <ChartBar />,
  },
  {
    title: "Visits",
    url: "/visits",
    icon: <MapPinned />,
  },
  {
    title: "Team",
    url: "/teams",
    icon: <Users />,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: <Settings2 />,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const { isMobile } = useSidebar()

  return (
    <Sidebar collapsible={isMobile ? "offcanvas" : "icon"} {...props}>
      {/* Brand */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Apex"
              render={<a href="/dashboard" />}
            >
              <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg">
                <img
                  src="/logo-light.svg"
                  alt="Apex"
                  className="size-7 dark:hidden"
                />
                <img
                  src="/logo.svg"
                  alt="Apex"
                  className="hidden size-7 dark:block"
                />
              </div>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold tracking-tight">Apex</span>
                <span className="truncate text-xs text-muted-foreground">
                  Field Operations & Tasks
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>

      {/* User */}
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>

      {!isMobile && <SidebarRail />}
    </Sidebar>
  )
}
