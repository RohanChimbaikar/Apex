import * as React from "react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {} from "lucide-react"

import ApexIcon from "@/assets/apex-icon.svg"

import {
  LayoutDashboard,
  ClipboardList,
  MapPinned,
  Users,
  Map,
  ChartNoAxesCombined,
  ShieldCheck,
  Settings,
  CircleHelp,
  Search,
  UserRound,
  Building2,
  FileText,
} from "lucide-react"
import { Link } from "react-router"

export const data = {
  user: {
    name: "Admin",
    email: "admin@apex.local",
    avatar: "/avatars/admin.jpg",
  },

  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: <LayoutDashboard />,
    },
    {
      title: "Tasks",
      url: "/tasks",
      icon: <ClipboardList />,
    },
    {
      title: "Field Visits",
      url: "/visits",
      icon: <MapPinned />,
    },
    {
      title: "Team Management",
      url: "/teams",
      icon: <Users />,
    },
    {
      title: "Regions",
      url: "/regions",
      icon: <Map />,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: <ChartNoAxesCombined />,
    },
  ],

  navClouds: [
    {
      title: "Operations",
      url: "/operations",
      icon: <Building2 />,
      isActive: true,
      items: [
        {
          title: "All Tasks",
          url: "/tasks",
        },
        {
          title: "Pending Tasks",
          url: "/tasks/pending",
        },
        {
          title: "Completed Tasks",
          url: "/tasks/completed",
        },
      ],
    },
    {
      title: "Field Visits",
      url: "/visits",
      icon: <MapPinned />,
      items: [
        {
          title: "All Visits",
          url: "/visits",
        },
        {
          title: "Scheduled Visits",
          url: "/visits/scheduled",
        },
        {
          title: "Visit History",
          url: "/visits/history",
        },
      ],
    },
    {
      title: "Administration",
      url: "/administration",
      icon: <ShieldCheck />,
      items: [
        {
          title: "Users",
          url: "/users",
        },
        {
          title: "Audit Logs",
          url: "/audit-logs",
        },
      ],
    },
  ],

  navSecondary: [
    {
      title: "Search",
      url: "/search",
      icon: <Search />,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: <Settings />,
    },
    {
      title: "Help & Support",
      url: "/help",
      icon: <CircleHelp />,
    },
  ],

  documents: [
    {
      name: "My Profile",
      url: "/profile",
      icon: <UserRound />,
    },
    {
      name: "Reports",
      url: "/reports",
      icon: <FileText />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link to="/" />}
            >
              <img
                src={ApexIcon}
                alt=""
                className="size-8 shrink-0 dark:invert"
              />
              <span className="text-xl font-semibold">Apex</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
