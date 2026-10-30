import { z } from 'zod'

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id')

export const idParams = z.object({ id: objectId })

/**
 * A calendar day with no time or timezone, e.g. "2026-10-30".
 * Used for due dates: "due Friday" means Friday wherever the user is, so it
 * must not be stored as an instant that shifts across timezones.
 */
export const calendarDate = z.iso.date()

/** Query string values arrive as strings; accept ISO datetimes and coerce to Date. */
export const instant = z.coerce.date()
