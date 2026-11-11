import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeTask, user, workList } from '@/test/fixtures'
import { json, mockApi } from '@/test/mockApi'
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

  it('adds a task due today', async () => {
    const created = makeTask({ title: 'Prep for interview', dueDate: today })
    let saved = tasks
    const fetchMock = mockApi({
      ...baseRoutes(),
      'GET /api/tasks': () => json({ tasks: saved }),
      'POST /api/tasks': () => {
        saved = [...tasks, created]
        return json({ task: created }, 201)
      },
    })
    renderApp('/today')
    const input = await screen.findByRole('textbox', { name: 'New task title' })

    await userEvent.type(input, 'Prep for interview{Enter}')

    // Saved, then the list refetches and shows it. The input is cleared for the next one.
    expect(await screen.findByText('Prep for interview')).toBeInTheDocument()
    expect(input).toHaveValue('')
    const post = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')
    expect(JSON.parse(post[1].body)).toMatchObject({ title: 'Prep for interview', dueDate: today })
  })

  it('marks a task done', async () => {
    const fetchMock = mockApi({
      ...baseRoutes(),
      [`PATCH /api/tasks/${tasks[1].id}`]: () => json({ task: tasks[1] }),
    })
    renderApp('/today')

    await userEvent.click(
      await screen.findByRole('checkbox', { name: 'Mark "Ship the PR" as done' }),
    )

    await waitFor(() => {
      const patch = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH')
      expect(JSON.parse(patch[1].body)).toEqual({ completed: true })
    })
  })

  it('shows scheduled tasks on the agenda and opens them', async () => {
    const scheduledTask = makeTask({
      title: 'Deep work block',
      scheduledStart: new Date(2026, 9, 30, 10).toISOString(),
      scheduledEnd: new Date(2026, 9, 30, 11, 30).toISOString(),
    })
    mockApi({
      ...baseRoutes(),
      'GET /api/tasks': ({ url }) =>
        json({ tasks: url.searchParams.has('scheduledFrom') ? [scheduledTask] : tasks }),
      [`GET /api/tasks/${scheduledTask.id}`]: () => json({ task: scheduledTask }),
    })
    renderApp('/today')

    const agenda = await screen.findByRole('list', { name: /Schedule for Friday, October 30/ })
    const block = await within(agenda).findByRole('button', {
      name: /Deep work block.*10:00–11:30 AM/,
    })

    // Clicking a scheduled task opens its details.
    await userEvent.click(block)
    expect(await screen.findByRole('dialog', { name: 'Task details' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Deep work block')
  })

  it('redirects to login when signed out', async () => {
    mockApi({ 'GET /api/auth/me': () => json({ user: null }) })
    renderApp('/today')
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
  })
})
