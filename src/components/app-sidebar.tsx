"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import {
  IconBrandAsana,
  IconCreditCard,
  IconDashboard,
  IconExclamationCircle,
  IconInnerShadowTop,
  IconMail,
  IconReport,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"
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
      icon: IconDashboard,
    },
    {
      title: "Clients",
      url: "/admin/clients",
      icon: IconUsers,
    },
    {
      title: "Billing",
      url: "#",
      icon: IconCreditCard,
    },
    {
      title: "Subscriptions",
      url: "#",
      icon: IconBrandAsana,
    },
    {
      title: "Messaging",
      url: "#",
      icon: IconMail,
    },
    {
      title: "Reporting",
      url: "#",
      icon: IconReport,
    },
    {
      title: "Exceptions",
      url: "#",
      icon: IconExclamationCircle,
    },
  ]

  // Only show Users tab for ADMIN users
  if (userRole === "ADMIN") {
    baseNavItems.splice(1, 0, {
      title: "Users",
      url: "/admin/users",
      icon: IconUsers,
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
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/admin">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Nexus</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
