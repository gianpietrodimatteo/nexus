"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import {
  IconSettings,
} from "@tabler/icons-react"
import {
  DashboardIcon,
  ClientsIcon,
  BillingIcon,
  SubscriptionsIcon,
  ExceptionsIcon,
  UsersIcon,
} from "@/components/icons/custom-icons"
import type { AuthSession } from "@/server/auth/types"

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

const getNavData = (userRole?: string) => {
  const baseNavItems = [
    {
      title: "Dashboard",
      url: "/admin",
      icon: DashboardIcon,
    },
    {
      title: "Clients",
      url: "/admin/clients",
      icon: ClientsIcon,
    },
    {
      title: "Billing",
      url: "/admin/billing",
      icon: BillingIcon,
    },
    {
      title: "Subscriptions",
      url: "#",
      icon: SubscriptionsIcon,
    },
    {
      title: "Exceptions",
      url: "#",
      icon: ExceptionsIcon,
    },
  ]

  // Only show Users tab for ADMIN users
  if (userRole === "ADMIN") {
    baseNavItems.splice(1, 0, {
      title: "Users",
      url: "/admin/users",
      icon: UsersIcon,
    })
  }

  return {
    user: {
      name: "Admin User",
      email: "admin@nexus.com",
      avatar: "/avatars/admin.jpg",
    },
    navMain: baseNavItems,
    navSecondary: [
      {
        title: "Settings",
        url: "#",
        icon: IconSettings,
      },
    ],
  }
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const authSession = session as AuthSession | null
  const data = getNavData(authSession?.user?.role)

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="h-[72px] flex items-center justify-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/admin" className="flex items-center gap-3">
                <img src="/braintrust-logo.svg" alt="Nexus" className="!size-6" />
                <span className="text-lg font-semibold">Nexus</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
    </Sidebar>
  )
}
