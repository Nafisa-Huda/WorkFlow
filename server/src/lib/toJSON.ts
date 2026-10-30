import type { ToObjectOptions } from 'mongoose'

/**
 * Shared JSON shape for API responses: expose `id` instead of `_id`,
 * and drop internal fields the client never needs.
 */
export const toJSON: ToObjectOptions = {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: Record<string, unknown>) => {
    delete ret._id
    delete ret.userId
    return ret
  },
}
