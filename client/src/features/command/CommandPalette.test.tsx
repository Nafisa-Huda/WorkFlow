import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { makeTask, user, workList } from '@/test/fixtures'
import { json, mockApi } from '@/test/mockApi'
import { renderApp } from '@/test/render'

const task = makeTask({ title: 'Write the README', dueDate: '2026-11-04' })

function routes(extra = {}) {
  return {
    'GET /api/auth/me': () => json({ user }),
    'GET /api/lists': () => json({ lists: [workList] }),
    'GET /api/tasks': () => json({ tasks: [task] }),
    [`GET /api/tasks/${task.id}`]: () => json({ task }),
    'GET /api/events': () => json({ events: [] }),
    ...extra,
  }
}

async function openPalette() {
  await screen.findByRole('heading', { name: 'Inbox' })
  await userEvent.keyboard('{Control>}k{/Control}')
  return screen.findByRole('dialog', { name: 'Command palette' })
}

describe('command palette', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('opens with Ctrl+K and finds a task, opening its details', async () => {
    mockApi(routes())
    renderApp('/inbox')
    const palette = await openPalette()

    await userEvent.type(within(palette).getByRole('combobox'), 'readme')
    await userEvent.click(within(palette).getByRole('option', { name: /Write the README/ }))

    // The detail sheet is driven by ?task=<id>, so it opens from anywhere.
    expect(await screen.findByRole('dialog', { name: 'Task details' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Write the README')
  })

  it('adds a task from whatever was typed', async () => {
    const fetchMock = mockApi(
      routes({
        'POST /api/tasks': () => json({ task: makeTask({ title: 'Call the dentist' }) }, 201),
      }),
    )
    renderApp('/inbox')
    const palette = await openPalette()

    await userEvent.type(within(palette).getByRole('combobox'), 'Call the dentist')
    await userEvent.click(
      within(palette).getByRole('option', { name: /Add task “Call the dentist”/ }),
    )

    const post = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')
    expect(JSON.parse(String(post?.[1]?.body))).toEqual({ title: 'Call the dentist' })
  })

  it('navigates to a list', async () => {
    mockApi(routes())
    renderApp('/inbox')
    const palette = await openPalette()

    await userEvent.click(within(palette).getByRole('option', { name: 'Work' }))

    expect(await screen.findByRole('heading', { name: 'Work', level: 1 })).toBeInTheDocument()
  })
})
