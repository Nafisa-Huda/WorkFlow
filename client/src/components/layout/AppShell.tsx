import { Outlet } from 'react-router'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { CommandPaletteProvider } from '@/features/command/CommandPalette'
import { EventDialog } from '@/features/events/EventDialog'
import { TaskDetailSheet } from '@/features/tasks/TaskDetailSheet'
import { AppSidebar } from './AppSidebar'

export function AppShell() {
  return (
    <CommandPaletteProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-12 items-center border-b bg-background/80 px-3 backdrop-blur md:hidden">
            <SidebarTrigger aria-label="Toggle sidebar" />
          </header>
          {/* SidebarInset is already the page's <main> landmark. */}
          <div className="flex-1">
            <Outlet />
          </div>
        </SidebarInset>
        {/* Opened from anywhere via ?task= and ?event= in the URL. */}
        <TaskDetailSheet />
        <EventDialog />
      </SidebarProvider>
    </CommandPaletteProvider>
  )
}
