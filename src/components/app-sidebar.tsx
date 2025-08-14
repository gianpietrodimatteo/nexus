"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import type { AuthSession } from "@/server/auth/types"

import { NavMain } from "@/components/nav-main"
// import { NavSecondary } from "@/components/nav-secondary"
// import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
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
      icon: "dashboard",
    },
    {
      title: "Clients",
      url: "/admin/clients",
      icon: "clients",
    },
    {
      title: "Billing",
      url: "/admin/billing",
      icon: "billing",
    },
    {
      title: "Subscriptions",
      url: "/admin/subscriptions",
      icon: "subscriptions",
    },
    {
      title: "Exceptions",
      url: "/admin/exceptions",
      icon: "exceptions",
    },
  ]

  // Only show Users tab for ADMIN users
  if (userRole === "ADMIN") {
    baseNavItems.splice(1, 0, {
      title: "Users",
      url: "/admin/users",
      icon: "users",
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
        icon: "settings",
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
