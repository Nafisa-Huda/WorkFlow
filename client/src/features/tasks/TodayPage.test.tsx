import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeTask, user, workList } from '@/test/fixtures'
import { deferred, json, mockApi } from '@/test/mockApi'
import { renderApp } from '@/test/render'

const today = '2026-10-30'

describe('Today page', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 30, 9, 0))
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  const tasks = [
    makeTask({ title: 'Overdue report', dueDate: '2026-10-28', priority: 'high' }),
    makeTask({ title: 'Ship the PR', dueDate: today, listId: workList.id }),
    makeTask({ title: 'Already done', dueDate: today, completedAt: '2026-10-30T13:00:00.000Z' }),
  ]

  function baseRoutes() {
    return {
      'GET /api/auth/me': () => json({ user }),
      'GET /api/lists': () => json({ lists: [workList] }),
      'GET /api/tasks': () => json({ tasks }),
      'GET /api/events': () => json({ events: [] }),
    }
  }

  it('groups overdue, today, and completed tasks', async () => {
    mockApi(baseRoutes())
    renderApp('/today')

    const overdue = await screen.findByRole('region', { name: /overdue/i })
    expect(within(overdue).getByText('Overdue report')).toBeInTheDocument()
    const main = within(screen.getByRole('main'))
    expect(main.getByText('Ship the PR')).toBeInTheDocument()
    expect(main.getByText('Work')).toBeInTheDocument() // list name shown on the task
    expect(main.getByText('Completed')).toBeInTheDocument()
  })

  it('shows a new task immediately, before the server responds', async () => {
    const saved = deferred<Response>()
    const fetchMock = mockApi({ ...baseRoutes(), 'POST /api/tasks': () => saved.promise })
    renderApp('/today')
    const input = await screen.findByRole('textbox', { name: 'New task title' })

    await userEvent.type(input, 'Prep for interview{Enter}')

    // Optimistic: rendered while the POST is still in flight, and the input is ready for the next one.
    expect(await screen.findByText('Prep for interview')).toBeInTheDocument()
    expect(input).toHaveValue('')
    const post = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')
    expect(JSON.parse(String(post?.[1]?.body))).toMatchObject({
      title: 'Prep for interview',
      dueDate: today,
    })

    saved.resolve(json({ task: makeTask({ title: 'Prep for interview', dueDate: today }) }, 201))
  })

  it('rolls back an optimistic task when the server rejects it', async () => {
    const rejected = deferred<Response>()
    mockApi({ ...baseRoutes(), 'POST /api/tasks': () => rejected.promise })
    renderApp('/today')
    const input = await screen.findByRole('textbox', { name: 'New task title' })

    await userEvent.type(input, 'Doomed task{Enter}')
    expect(await screen.findByText('Doomed task')).toBeInTheDocument()

    rejected.resolve(json({ error: 'Validation failed' }, 400))
    await waitFor(() => expect(screen.queryByText('Doomed task')).not.toBeInTheDocument())
  })

  it('marks a task done optimistically', async () => {
    const patch = deferred<Response>()
    mockApi({ ...baseRoutes(), [`PATCH /api/tasks/${tasks[1]!.id}`]: () => patch.promise })
    renderApp('/today')

    await userEvent.click(
      await screen.findByRole('checkbox', { name: 'Mark "Ship the PR" as done' }),
    )

    expect(screen.getByRole('checkbox', { name: 'Mark "Ship the PR" as not done' })).toBeChecked()
  })

  it('shows events and scheduled tasks on the agenda', async () => {
    const scheduledTask = makeTask({
      title: 'Deep work block',
      scheduledStart: new Date(2026, 9, 30, 10).toISOString(),
      scheduledEnd: new Date(2026, 9, 30, 11, 30).toISOString(),
    })
    const event = {
      id: 'event-1',
      title: 'Team standup',
      notes: '',
      start: new Date(2026, 9, 30, 9, 30).toISOString(),
      end: new Date(2026, 9, 30, 10).toISOString(),
      createdAt: '',
      updatedAt: '',
    }
    mockApi({
      ...baseRoutes(),
      'GET /api/tasks': ({ url }) =>
        json({ tasks: url.searchParams.has('scheduledFrom') ? [scheduledTask] : tasks }),
      'GET /api/events': () => json({ events: [event] }),
    })
    renderApp('/today')

    const agenda = await screen.findByRole('list', { name: /Schedule for Friday, October 30/ })
    expect(await within(agenda).findByRole('button', { name: /Team standup/ })).toBeInTheDocument()
    expect(
      within(agenda).getByRole('button', { name: /Deep work block.*10:00–11:30 AM/ }),
    ).toBeInTheDocument()

    // Clicking an event opens it for editing.
    await userEvent.click(within(agenda).getByRole('button', { name: /Team standup/ }))
    expect(await screen.findByRole('dialog', { name: 'Edit event' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Team standup')
  })

  it('redirects to login when signed out', async () => {
    mockApi({ 'GET /api/auth/me': () => json({ user: null }) })
    renderApp('/today')
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
  })
})
