import { z } from 'zod'

// Reusable zod pieces for request validation.

/**
 * A calendar day with no time or timezone, e.g. "2026-10-30".
 * Used for due dates: "due Friday" means Friday wherever the user is, so it
 * must not be stored as an instant that shifts across timezones.
 */
export const calendarDate = z.iso.date()

/** A point in time. Query string values arrive as strings, so coerce them to Date. */
export const instant = z.coerce.date()
