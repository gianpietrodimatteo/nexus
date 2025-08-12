"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import {
  IconBuilding,
  IconChartLine,
  IconSettings,
  IconUsers,
  IconWorkflow,
  IconClipboardList,
  IconBell,
  IconFile,
} from "@tabler/icons-react"

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
import type { AuthSession } from "@/server/auth/types"

const clientNavMain = [
  {
    title: "Dashboard",
    url: "/client",
    icon: IconChartLine,
    isActive: false,
  },
  {
    title: "Workflows",
    url: "/client/workflows",
    icon: IconWorkflow,
    isActive: false,
  },
  {
    title: "Users",
    url: "/client/users",
    icon: IconUsers,
    isActive: false,
  },
  {
    title: "Notifications",
    url: "/client/notifications",
    icon: IconBell,
    isActive: false,
  },
  {
    title: "Reports",
    url: "/client/reports",
    icon: IconClipboardList,
    isActive: false,
  },
  {
    title: "Documents",
    url: "/client/documents",
    icon: IconFile,
    isActive: false,
  },
]

const clientNavSecondary = [
  {
    title: "Settings",
    url: "/client/settings",
    icon: IconSettings,
  },
]

export function ClientSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const authSession = session as AuthSession | null

  const orgName = authSession?.user.impersonationContext?.organizationName || 
                 authSession?.user.organization?.name || 
                 "Client Portal"

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/client">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <IconBuilding className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{orgName}</span>
                  <span className="truncate text-xs">Client Portal</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={clientNavMain} />
        <NavSecondary items={clientNavSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}