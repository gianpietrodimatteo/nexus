"use client"

import { useSession } from "next-auth/react"
import { IconBell, IconChevronDown } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAdminHeader } from "@/components/admin-header-context"
import type { AuthSession } from "@/server/auth/types"

export function SiteHeader() {
  const { data: session } = useSession()
  const authSession = session as AuthSession | null
  const { headerContent } = useAdminHeader()

  return (
    <header className="flex min-h-[72px] shrink-0 items-center gap-2 border-b bg-white shadow-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:min-h-[72px]">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 py-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        
        {headerContent ? (
          <div className="flex flex-1 items-center justify-between gap-6">
            <h1 className="text-xl font-semibold text-[#141417]">{headerContent.title}</h1>
            
            <div className="flex items-center gap-6">
              {headerContent.navigation && (
                <div className="flex items-center">
                  {headerContent.navigation}
                </div>
              )}
              
              {headerContent.actions && (
                <div className="flex items-center">
                  {headerContent.actions}
                </div>
              )}
            </div>
          </div>
        ) : (
          <h1 className="text-xl font-normal text-[#141417]">Dashboard</h1>
        )}
        
        <div className="ml-auto flex items-center gap-3">
          {/* Notification Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-full hover:bg-gray-50"
          >
            <IconBell className="h-5 w-5 text-[#141417]" />
          </Button>

          {/* User Profile Dropdown */}
          {authSession && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 h-12 px-2 hover:bg-gray-50 rounded-lg"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage 
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${authSession.user.name}`} 
                      alt={authSession.user.name} 
                    />
                    <AvatarFallback className="bg-gray-200 text-gray-700">
                      {authSession.user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <IconChevronDown className="h-3.5 w-3.5 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg"
                align="end"
                sideOffset={8}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${authSession.user.name}`} 
                        alt={authSession.user.name} 
                      />
                      <AvatarFallback className="bg-gray-200 text-gray-700">
                        {authSession.user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{authSession.user.name}</span>
                      <span className="text-muted-foreground truncate text-xs">
                        {authSession.user.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Preferences
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
