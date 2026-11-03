import { Outlet } from 'react-router'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'

export function AppShell() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-12 items-center border-b bg-background/80 px-3 backdrop-blur md:border-0 md:bg-transparent">
          <SidebarTrigger aria-label="Toggle sidebar" />
        </header>
        {/* SidebarInset is already the page's <main> landmark. */}
        <div className="flex-1">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
