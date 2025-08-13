"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import {
  IconBuilding,
  IconChartLine,
  IconUsers,
  IconTrendingUp,
  IconClipboardList,
  IconKey,
  IconAlertTriangle,
  IconCreditCard,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
// import { NavSecondary } from "@/components/nav-secondary"
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
    title: "Workflow ROI",
    url: "/client/workflow-roi",
    icon: IconTrendingUp,
    isActive: false,
  },
  {
    title: "Reporting",
    url: "/client/reporting",
    icon: IconClipboardList,
    isActive: false,
  },
  {
    title: "Credentials",
    url: "/client/credentials",
    icon: IconKey,
    isActive: false,
  },
  {
    title: "Exceptions",
    url: "/client/exceptions",
    icon: IconAlertTriangle,
    isActive: false,
  },
  {
    title: "Users",
    url: "/client/users",
    icon: IconUsers,
    isActive: false,
  },
  {
    title: "Billing",
    url: "/client/billing",
    icon: IconCreditCard,
    isActive: false,
  },
]

// const clientNavSecondary = [
//   {
//     title: "Settings",
//     url: "/client/settings",
//     icon: IconSettings,
//   },
// ]

export function ClientSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const authSession = session as AuthSession | null

  const orgName = authSession?.user.impersonationContext?.organizationName || 
                 authSession?.user.organization?.name || 
                 "Client Portal"

  const navUser = {
    name: authSession?.user?.name ?? "User",
    email: authSession?.user?.email ?? "",
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      authSession?.user?.name ?? "User"
    )}`,
  }

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
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUser} />
      </SidebarFooter>
    </Sidebar>
  )
}