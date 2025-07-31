"use client"

import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"
import Link from "next/link"
import { useSelectedLayoutSegments } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const segments = useSelectedLayoutSegments()
  const currentPath = segments.length > 0 ? segments[0] : undefined
  
  const isActive = (url: string) => {
    // For the root admin page
    if (url === "/admin" && segments.length === 0) return true
    // For sub-pages like /admin/users
    if (url.includes("/admin/") && currentPath) {
      return url.includes(`/${currentPath}`)
    }
    return false
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild
                tooltip={item.title}
                className={isActive(item.url) ? "bg-[#E3DDDD] text-foreground font-medium" : ""}
              >
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
