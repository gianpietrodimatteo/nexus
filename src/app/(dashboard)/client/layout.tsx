import { ClientSidebar } from "@/components/client-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AdminHeaderProvider } from "@/components/admin-header-context" // Reusing for now
import { Suspense } from "react"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminHeaderProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "72px",
          } as React.CSSProperties
        }
        className="!gap-0"
      >
        <ClientSidebar variant="inset" className="!border-r-0" />
        <SidebarInset className="m-0 md:peer-data-[variant=inset]:m-0 !rounded-none md:peer-data-[variant=inset]:rounded-none md:peer-data-[variant=inset]:shadow-none">
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2 p-6">
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