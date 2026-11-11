import {
  CalendarDays,
  CalendarRange,
  ChevronsUpDown,
  Inbox,
  LogOut,
  MoreHorizontal,
  Plus,
  Sun,
  Pencil,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router'
import { Logo } from '@/components/Logo'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useLogout, useCurrentUser } from '@/features/auth/api'
import { useDeleteList, useLists } from '@/features/lists/api'
import { ListDialog } from '@/features/lists/ListDialog'
import { ListColorDot } from '@/features/lists/ListColorDot'
import { FocusTimer } from '@/features/focus/FocusTimer'
import { useTasks } from '@/features/tasks/api'
import { todayKey } from '@/lib/dates'

/** Open-task counts for the sidebar badges, worked out from one query of all open tasks. */
function useTaskCounts() {
  const { data: tasks = [] } = useTasks({ status: 'open' })
  const today = todayKey()
  const byList = new Map()
  let inbox = 0
  let dueToday = 0
  for (const task of tasks) {
    if (task.dueDate && task.dueDate <= today) dueToday++
    if (task.listId) byList.set(task.listId, (byList.get(task.listId) ?? 0) + 1)
    else inbox++
  }
  return { inbox, dueToday, byList }
}

const NAV = [
  { to: '/today', label: 'Today', icon: Sun, count: 'dueToday' },
  { to: '/upcoming', label: 'Upcoming', icon: CalendarRange },
  { to: '/inbox', label: 'Inbox', icon: Inbox, count: 'inbox' },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
]

export function AppSidebar() {
  const counts = useTaskCounts()
  const { data: lists, isPending: listsPending } = useLists()
  const deleteList = useDeleteList()
  const [creatingList, setCreatingList] = useState(false)
  const [editingList, setEditingList] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3">
        <Logo to="/today" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => {
                const count = counts[item.count] ?? 0
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={location.pathname === item.to}>
                      <NavLink to={item.to}>
                        <item.icon />
                        {item.label}
                      </NavLink>
                    </SidebarMenuButton>
                    {count > 0 && <SidebarMenuBadge>{count}</SidebarMenuBadge>}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Lists</SidebarGroupLabel>
          <SidebarGroupAction title="New list" onClick={() => setCreatingList(true)}>
            <Plus />
            <span className="sr-only">New list</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {listsPending &&
                Array.from({ length: 3 }, (_, i) => (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuSkeleton />
                  </SidebarMenuItem>
                ))}
              {lists?.map((list) => {
                const path = `/lists/${list.id}`
                const count = counts.byList.get(list.id) ?? 0
                return (
                  <SidebarMenuItem key={list.id}>
                    <SidebarMenuButton asChild isActive={location.pathname === path}>
                      <NavLink to={path}>
                        <ListColorDot color={list.color} className="mx-1" />
                        <span className="truncate">{list.name}</span>
                      </NavLink>
                    </SidebarMenuButton>
                    {count > 0 && (
                      <SidebarMenuBadge className="group-hover/menu-item:md:opacity-0 max-md:right-7">
                        {count}
                      </SidebarMenuBadge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction showOnHover aria-label={`${list.name} options`}>
                          <MoreHorizontal />
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start">
                        <DropdownMenuItem onSelect={() => setEditingList(list)}>
                          <Pencil />
                          Edit list
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() =>
                            deleteList.mutate(list.id, {
                              onSuccess: () => location.pathname === path && navigate('/inbox'),
                            })
                          }
                        >
                          <Trash2 />
                          Delete list
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Focus timer</SidebarGroupLabel>
          <SidebarGroupContent>
            <FocusTimer />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
      <SidebarRail />
      <ListDialog open={creatingList} onOpenChange={setCreatingList} />
      {editingList && (
        <ListDialog
          key={editingList.id}
          list={editingList}
          open
          onOpenChange={() => setEditingList(null)}
        />
      )}
    </Sidebar>
  )
}

function UserMenu() {
  const { data: user } = useCurrentUser()
  const logout = useLogout()
  const navigate = useNavigate()
  if (!user) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </span>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="w-(--radix-dropdown-menu-trigger-width)"
          >
            <DropdownMenuLabel className="font-normal text-muted-foreground">
              Signed in as {user.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => logout.mutate(undefined, { onSuccess: () => navigate('/') })}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
