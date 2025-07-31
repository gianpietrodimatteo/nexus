import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AdminHeaderProvider } from "@/components/admin-header-context"
import { Suspense } from "react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminHeaderProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
                {children}
              </Suspense>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AdminHeaderProvider>
  )
}